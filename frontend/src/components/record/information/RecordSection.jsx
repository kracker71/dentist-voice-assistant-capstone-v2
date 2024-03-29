import RecordBuccalInformation from "./RecordBuccalInformation";
import RecordLingualInformation from "./RecordLingualInformation";
import RecordFurcationInformation from "./RecordFurcationInformation";
import RecordToothInformation from "./RecordToothInformation";
import DropdownMode from "./type/DropdownMode";
import classes from "./RecordSection.module.css";
import React from "react";

const RecordSection = ({
  quadrant,
  information,
  handleSetInformation,
  handleUndoToothMissing,
  handleAddToothMissing,
  tooth,
  currentCommand,
}) => {
  const buccalInformation = information.depended_side_data[0];
  const lingualInformation = information.depended_side_data[1];
  const furcationInformation = information.FUR
  // console.log(information)

  const mo = information.MO;
  const mgj = information.MGJ;
  const id = information.ID;

  let highlightCommandBuccalSide = false;
  let highlightCommandLingualSide = false;
  let highlightFurcation = false
  const command =
    !!currentCommand && !!currentCommand.command
      ? currentCommand.command
      : null;
  if (["PDRE","PD","RE","BOP","SUP"].includes(command) ) {
    const side = !!currentCommand.side
      ? currentCommand.side.toLowerCase()
      : null;
    if (side === "buccal") {
      highlightCommandBuccalSide = true;
    } else if (side === "lingual") {
      highlightCommandLingualSide = true;
    }
  } else if (command === "MGJ") {
    highlightCommandBuccalSide = true;
  } else if (command === "MO") {
    highlightCommandLingualSide = true;
  } else if (command === "FUR"){
    highlightFurcation = true
  }

  const handleClickMissingBox = () => {
    handleUndoToothMissing(quadrant, information.ID);
  };

  const handleClickToothIDDiv = () => {
    handleAddToothMissing(quadrant, information.ID);
  };

  return (
    <div>
      {/* not missing */}
      {!information.missing && (
        <div className={classes.direction}>
          {(information.bridge_edge || !information.bridge) && <RecordBuccalInformation
            quadrant={quadrant}
            id={id}
            buccalInformation={buccalInformation}
            mgj={mgj}
            handleSetInformation={handleSetInformation}
            currentCommand={highlightCommandBuccalSide ? currentCommand : null}
          />}
          {!information.bridge_edge && information.bridge && (
            <div className={classes.largeBridgeBox}/>
          )}
          <div className={classes.emptyBox2}/>
          {!!information.FUR && (information.bridge_edge || !information.bridge) && (
            <RecordFurcationInformation
            quadrant={quadrant}
            id={id}
            furcation={furcationInformation}
            handleSetInformation={handleSetInformation}
            currentCommand={highlightFurcation? currentCommand:null}
          />
          )}
          {(!information.FUR || (!information.bridge_edge && information.bridge)) && (
            <div className={classes.emptyBox}/>
          )}
          {/* <div
            className={`${classes.title} ${
              !!currentCommand ? classes.hightlighted : null
            }`}
            onClick={handleClickToothIDDiv}
          >{`${quadrant}${information.ID}`}</div> */}
          <RecordToothInformation
            quadrant={quadrant}
            id={id}
            information={information}
            handleSetInformation={handleSetInformation}
            isHighlighted={!!currentCommand}
          >
          </RecordToothInformation>
          {(information.bridge_edge || !information.bridge) && <RecordLingualInformation
            quadrant={quadrant}
            id={id}
            lingualInformation={lingualInformation}
            mo={mo}
            handleSetInformation={handleSetInformation}
            currentCommand={highlightCommandLingualSide ? currentCommand : null}
          />}
          {!information.bridge_edge && information.bridge&& (
            <div className={classes.largeBridgeBox}/>
          )}
        </div>
      )}
      {/* missing */}
      {information.missing && !information.bridge && (
        <div className={classes.direction}>
          <div className={classes.missingBox} onClick={handleClickMissingBox}>
            <div
              className={classes.title}
            >{`${quadrant}${information.ID}`}</div>
          </div>
        </div>
      )}
      {/* bridge */}
    </div>
  );
};

export default RecordSection;
