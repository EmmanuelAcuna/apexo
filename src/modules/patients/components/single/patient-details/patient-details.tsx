import "./patient-details.scss";

import * as React from "react";

import { Dropdown, TextField, Label as MSLabel } from "office-ui-fabric-react";
import { Gender, Patient, patients } from "../../../data";
import { getRandomLabelType } from "../../../../../assets/components/label/label.component";

import { EditableList } from "../../../../../assets/components/editable-list/editable-list";
import { TagInput } from "../../../../../assets/components/tag-input/tag-input";
import { observer } from "mobx-react";
import { Row, Col } from "../../../../../assets/components/grid/index";
import setting from "../../../../settings/data/data.settings";
import { computed } from "mobx";
import { API } from "../../../../../core/index";
import { lang } from "../../../../../core/i18/i18";

@observer
export class PatientDetails extends React.Component<{
	patient: Patient;
}> {
	@computed get canEdit() {
		return API.user.currentUser.canEditPatients;
	}

	render() {
		return (
			<div className="single-patient-details">
				<div className="basic-info">
					<div className="name">
						<TextField
							label="Name"
							value={this.props.patient.name}
							onChanged={name => (this.props.patient.name = name)}
							disabled={!this.canEdit}
						/>
					</div>
					<Row gutter={6}>
						<Col sm={12}>
							<div className="birth">
								<TextField
									label={lang("Birth Year / Age")}
									value={this.props.patient.birthYearOrAge.toString()}
									onChanged={year =>
										(this.props.patient.birthYearOrAge = Number(
											year
										))
									}
									type="number"
									disabled={!this.canEdit}
								/>
							</div>
						</Col>
						<Col sm={12}>
							<div className="gender">
								<Dropdown
									label={lang("Gender")}
									placeHolder="Gender"
									selectedKey={
										this.props.patient.gender ===
										Gender.male
											? "male"
											: "female"
									}
									options={[
										{ key: "male", text: lang("Male") },
										{ key: "female", text: lang("Female") }
									]}
									onChanged={val => {
										if (val.key === "male") {
											this.props.patient.gender =
												Gender.male;
										} else {
											this.props.patient.gender =
												Gender.female;
										}
									}}
									disabled={!this.canEdit}
								/>
							</div>
						</Col>
					</Row>

					<TextField
						label={lang("Phone")}
						value={this.props.patient.phone}
						onChanged={phone => (this.props.patient.phone = phone)}
						type="number"
						disabled={!this.canEdit}
					/>

					{setting.getSetting("OI_email") ? (
						<TextField
							label={lang("Email")}
							value={this.props.patient.email}
							onChanged={email =>
								(this.props.patient.email = email)
							}
							disabled={!this.canEdit}
						/>
					) : (
						""
					)}

					{setting.getSetting("OI_address") ? (
						<TextField
							label={lang("Address")}
							value={this.props.patient.address}
							onChanged={address =>
								(this.props.patient.address = address)
							}
							disabled={!this.canEdit}
						/>
					) : (
						""
					)}

					<Row gutter={6}>
						<Col md={12}>
							{" "}
							<MSLabel>Labels</MSLabel>
							<TagInput
								disabled={!this.canEdit}
								className="patient-tags"
								placeholder={lang("Labels")}
								options={[""]
									.concat(
										...patients.list.map(patient =>
											patient.labels.map(
												label => label.text
											)
										)
									)
									.map(x => ({
										key: x,
										text: x
									}))
									.reduce(
										(
											arr: {
												key: string;
												text: string;
											}[],
											item
										) => {
											if (
												arr.findIndex(
													x => x.key === item.key
												) === -1
											) {
												arr.push(item);
											}
											return arr;
										},
										[]
									)}
								onChange={newVal => {
									this.props.patient.labels = newVal.map(
										item => {
											return {
												text: item.text,
												type: getRandomLabelType(
													item.text
												)
											};
										}
									);
								}}
								value={this.props.patient.labels.map(label => ({
									key: label.text,
									text: label.text
								}))}
							/>
						</Col>
						<Col md={12}>
							{" "}
							<MSLabel className="mh-label">
								{lang("Notes and medical history")}
							</MSLabel>
							<div className="medical-history">
								<EditableList
									label={lang("Notes")}
									value={this.props.patient.medicalHistory}
									onChange={newVal => {
										this.props.patient.medicalHistory = newVal;
									}}
									style={{ marginTop: "0" }}
									disabled={!this.canEdit}
								/>
							</div>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}
