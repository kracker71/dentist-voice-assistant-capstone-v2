import "bootstrap/dist/css/bootstrap.css";
import Navbar from "react-bootstrap/Navbar";
import classes from "./RecordControlBar.module.css";
import React from "react";
import documentIcon from "../../images/document.png"


function RecordControlBar(props) {
  return (
    <Navbar bg="black" variant="dark" fixed="bottom">
      <Navbar.Brand className={classes.actions}>
        <button
          className={classes.exportButton}
          onClick={props.checkMailExportHandler}
        >
          <img
            src={require("../../../src/images/icons8-send-email-24.png")}
            className={classes["icon"]}
          />
          {"Send to email"}
        </button>
        <button
          className={classes.chartButton}
          onClick={props.isInputChartHandler}
        >
          <img 
            src = {documentIcon}
            className={classes["icon"]}
            height={30}
          />
          {"Proceed to Chart"}
        </button>
        <button
          className={classes.saveAsButton}
          onClick={() => props.createReport(props.data, props.file_name)}
        >
          <img
            src={require("../../../src/images/icons8-microsoft-excel-24.png")}
            className={classes["icon"]}
          />
          {"Save as excel"}
        </button>
      </Navbar.Brand>
    </Navbar>
  );
}

export default RecordControlBar;
