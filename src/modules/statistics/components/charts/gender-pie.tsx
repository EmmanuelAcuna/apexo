import * as React from "react";

import { statistics } from "../../data";
import { computed } from "mobx";

import { Chart } from "../../data/interface.chart";
import { Gender } from "../../../patients/data/enum.gender";
import { PieChart } from "../../../../assets/components/charts/pie";
import { appointmentsData } from "../../../appointments";
import { observer } from "mobx-react";
import { lang } from "../../../../core/i18/i18";

@observer
class Component extends React.Component<{}, {}> {
	@computed
	get malePercentile() {
		return this.calculateGenderPercentile(Gender.male);
	}
	@computed
	get femalePercentile() {
		return this.calculateGenderPercentile(Gender.female);
	}
	render() {
		return (
			<PieChart
				height={400}
				{...{
					data: [
						{ label: lang("Male"), value: this.malePercentile },
						{ label: lang("Female"), value: this.femalePercentile }
					]
				}}
			/>
		);
	}
	calculateGenderPercentile(gender: Gender) {
		return statistics.selectedDays
			.map(
				day =>
					appointmentsData.appointments
						.appointmentsForDay(
							day.getFullYear(),
							day.getMonth() + 1,
							day.getDate()
						)
						.filter(
							appointment => appointment.patient.gender === gender
						).length
			)
			.reduce((total, males) => (total = total + males), 0);
	}
}

export const genderPie: Chart = {
	Component,
	name: lang("Patients' Gender"),
	description: lang("treated patients gender"),
	tags: "gender patients pie chart",
	className: "col-xs-12 col-lg-6"
};
