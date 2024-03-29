import { useState } from "react";
// import Dropdown from "react-bootstrap/Dropdown";
// import DropdownButton from "react-bootstrap/DropdownButton";
import classes from "./DropdownFurcationBox.module.css";
import DropdownFurcation from "./DropdownFurcation";
import React from "react";

function FurcationDropdownBox({
	quadrant,
	id,
	mode,
	data,
	handleSetInformation,
	// isHighlighted,
	isPositionHighlighted,
}) {
	const spec_id =
		quadrant === 1 || quadrant === 4
			? ["distal", "buccal", "lingual", "mesial"]
			: ["mesial", "buccal", "lingual", "distal"];
	// console.log(isHighlighted)
	// console.log(isPositionHighlighted);
	return (
		<div>
			<div className={classes.direction}>
				{`${quadrant}${id}` != "14" && `${quadrant}${id}` != "24" ? (
					<DropdownFurcation
						quadrant={quadrant}
						id={id}
						mode={mode}
						specific_id={spec_id[1]}
						data={data[spec_id[1]]}
						handleSetInformation={handleSetInformation}
						isHighlighted={
							(isPositionHighlighted &&
								!isPositionHighlighted.position) ||
							(isPositionHighlighted &&
								isPositionHighlighted.position === spec_id[1])
						}
					/>
				) : (
					<div className={classes.emptybox} />
				)}
			</div>
			<div className={classes.direction}>
				<DropdownFurcation
					quadrant={quadrant}
					id={id}
					mode={mode}
					specific_id={spec_id[0]}
					data={data[spec_id[0]]}
					handleSetInformation={handleSetInformation}
					isHighlighted={
						(isPositionHighlighted &&
							!isPositionHighlighted.position) ||
						(isPositionHighlighted &&
							isPositionHighlighted.position === spec_id[0])
					}
				/>
				{`${quadrant}${id}` != "14" && `${quadrant}${id}` != "24" ? (
					<DropdownFurcation
						quadrant={quadrant}
						id={id}
						mode={mode}
						specific_id={spec_id[2]}
						data={data[spec_id[2]]}
						handleSetInformation={handleSetInformation}
						isHighlighted={
							(isPositionHighlighted &&
								!isPositionHighlighted.position) ||
							(isPositionHighlighted &&
								isPositionHighlighted.position === spec_id[2])
						}
					/>
				) : (
					<div className={classes.emptybox} />
				)}

				<DropdownFurcation
					quadrant={quadrant}
					id={id}
					mode={mode}
					specific_id={spec_id[3]}
					data={data[spec_id[3]]}
					handleSetInformation={handleSetInformation}
					isHighlighted={
						(isPositionHighlighted &&
							!isPositionHighlighted.position) ||
						(isPositionHighlighted &&
							isPositionHighlighted.position === spec_id[3])
					}
				/>
			</div>
		</div>
	);
}
export default FurcationDropdownBox;
