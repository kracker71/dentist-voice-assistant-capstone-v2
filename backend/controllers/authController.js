const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");
const createExcel = require("./../utils/createExcelFile");
const verificationContent = require("./../utils/verifyEmail");

const FileSaver = require("file-saver");
const Blob = require("node-blob");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // console.log(req);
  const newUser = await User.create({
    email: req.body.email,
    dentistName: req.body.dentistName,
    dentistSurname: req.body.dentistSurname,
    dentistID: req.body.dentistID,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    data: {
      newUser,
    },
  });
});

exports.sendEmailConfirm = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide email", 400));
  }

  const user = await User.findOne({ email }).select("+active");

  if (!user) {
    return next(new AppError("Email does not exist in the database!", 400));
  }
  if (user.active) {
    return next(new AppError("This email was already active.", 400));
  }

  // 2) Generate the random reset token
  const confirmToken = user.createEmailConfirmToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const emailConfirmURL = `${req.protocol}://${req.get(
    "host"
  )}/user/activateAccount/${confirmToken}`;

  const emailContent = verificationContent.verificationContent(confirmToken);

  const message = `Please send a PATCH request to ${emailConfirmURL} to activate your account.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your email confirmation token (valid for 10 min)",
      message,
      html: emailContent,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.emailConfirmToken = undefined;
    user.emailConfirmExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.sendReportExcel = catchAsync(async (req, res, next) => {
  const data = req.body.data;
  const email = req.body.email;
  const file_name = req.body.file_name;

  try {
    const user = await User.findOne({ email }).select("+active");

    const wb = await createExcel.createReport(data);
    const buffer = await wb.xlsx.writeBuffer();

    await sendEmail({
      email: user.email,
      subject: "Report summary",
      message: "Report summary",
      attachments: [
        {
          filename: `${file_name}.xlsx`,
          content: buffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    });
    res.status(200).json({
      status: "success",
      message: "Created Report",
    });
  } catch (err) {
    return next(new AppError("Unable to create Report"), 500);
  }
});

exports.sendFile = catchAsync(async (req, res, next) => {
  const { email } = await User.findById(req.user.id);
  const message = `Send PDF Attach`;
  try {
    await sendEmail({
      email: email,
      subject: "Send PDF",
      message,
      attachments: [
        {
          filename: "buffer.pdf",
          path: "./buffer.pdf",
          contentType: "application/pdf",
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email: email, active: true }).select(
    "+password"
  );

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  console.log(user.password);
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email, active: true });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/user/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    active: true,
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.activateAccount = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  console.log(req.params.token, hashedToken);
  const user = await User.findOne({
    active: false,
    emailConfirmToken: hashedToken,
    emailConfirmExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, activate the new user
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.active = true;
  user.emailConfirmToken = undefined;
  user.emailConfirmExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // 3) Update active property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.getUserInfo = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
