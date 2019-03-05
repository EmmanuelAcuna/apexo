import * as dateUtils from "../../../../assets/utils/date";
import * as React from "react";
import { API } from "../../../../core";
import { computed, observable } from "mobx";
import { DataTable } from "../../../../assets/components/data-table/data-table.component";
import { genderToString, patients } from "../../data";
import { Label } from "../../../../assets/components/label/label.component";
import { observer } from "mobx-react";
import { Patient } from "../../data";
import { Profile } from "../../../../assets/components/profile/profile";
import { ProfileSquared } from "../../../../assets/components/profile/profile-squared";
import { SinglePatient } from "../single/single";
import "./listing.scss";

@observer
export class PatientsListing extends React.Component<{}, {}> {
	@observable selectedId: string = API.router.currentLocation.split("/")[1];

	@computed
	get patientIsSelected() {
		return patients.findIndexByID(this.selectedId) > -1;
	}

	@computed get canEdit() {
		return API.user.currentUser.canEditPatients;
	}

	render() {
		return (
			<div className="patients-component p-15 p-l-10 p-r-10">
				{this.patientIsSelected ? (
					<SinglePatient
						id={this.selectedId}
						onDismiss={() => (this.selectedId = "")}
					/>
				) : (
					""
				)}
				<DataTable
					onDelete={
						this.canEdit
							? id => {
									patients.deleteModal(id);
							  }
							: undefined
					}
					maxItemsOnLoad={15}
					className={"patients-data-table"}
					heads={[
						"Patient",
						"Last Appointment",
						"Next Appointment",
						"Label"
					]}
					rows={patients.list.map(patient => ({
						id: patient._id,
						searchableString: patient.searchableString,
						cells: [
							{
								dataValue:
									patient.name +
									" " +
									patient.age +
									" " +
									genderToString(patient.gender),
								component: (
									<Profile
										name={patient.name}
										secondaryElement={
											<span>
												Patient,{" "}
												{genderToString(patient.gender)}{" "}
												- {patient.age} years old
											</span>
										}
										size={3}
									/>
								),
								onClick: () => {
									this.selectedId = patient._id;
								},
								className: "no-label"
							},
							{
								dataValue: (
									patient.lastAppointment || { date: 0 }
								).date,
								component: patient.lastAppointment ? (
									<ProfileSquared
										text={
											patient.lastAppointment.treatment
												? patient.lastAppointment
														.treatment.type
												: ""
										}
										subText={dateUtils.relativeFormat(
											patient.lastAppointment.date
										)}
										size={3}
										onClick={() => {}}
									/>
								) : (
									"Not registered"
								),
								className: "hidden-xs"
							},
							{
								dataValue: (
									patient.nextAppointment || {
										date: Infinity
									}
								).date,
								component: patient.nextAppointment ? (
									<ProfileSquared
										text={
											patient.nextAppointment.treatment
												? patient.nextAppointment
														.treatment.type
												: ""
										}
										subText={dateUtils.relativeFormat(
											patient.nextAppointment.date
										)}
										size={3}
										onClick={() => {}}
									/>
								) : (
									"Not registered"
								),
								className: "hidden-xs"
							},
							{
								dataValue: patient.name,
								component: (
									<div>
										{patient.labels.map((label, index) => {
											return (
												<Label
													key={index}
													text={label.text}
													type={label.type}
												/>
											);
										})}
									</div>
								),
								className: "hidden-xs"
							}
						]
					}))}
					commands={
						this.canEdit
							? [
									{
										key: "addNew",
										title: "Add new",
										name: "Add New",
										onClick: () => {
											const patient = new Patient();
											patients.list.push(patient);
											this.selectedId = patient._id;
											API.router.go([
												"patients",
												patient._id
											]);
										},
										iconProps: {
											iconName: "Add"
										}
									}
							  ]
							: []
					}
				/>
			</div>
		);
	}
}
