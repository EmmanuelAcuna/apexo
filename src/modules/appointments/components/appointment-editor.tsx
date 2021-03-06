import * as dateUtils from "../../../assets/utils/date";
import * as React from "react";
import { API } from "../../../core";
import { Appointment, appointments } from "../data";
import { Col, Row } from "../../../assets/components/grid/index";
import { computed, observable } from "mobx";
import { convert } from "../../../assets/utils/teeth-numbering-systems";
import {
	DatePicker,
	Dropdown,
	Icon,
	IconButton,
	Panel,
	PanelType,
	PrimaryButton,
	TextField,
	Toggle,
	Checkbox,
	Slider,
	DefaultButton
} from "office-ui-fabric-react";
import { staffData } from "../../staff";
import { Tag, TagType } from "../../../assets/components/label/label.component";
import { observer } from "mobx-react";
import { patientsData } from "../../patients";
import { prescriptionsData } from "../../prescriptions";
import { Profile } from "../../../assets/components/profile/profile";
import { ProfileSquared } from "../../../assets/components/profile/profile-squared";
import { round } from "../../../assets/utils/round";
import { Section } from "../../../assets/components/section/section";
import { settingsData } from "../../settings";
import { TagInput } from "../../../assets/components/tag-input/tag-input";
import { Treatment } from "../../treatments/data/class.treatment";
import { treatmentsData } from "../../treatments";
import "./appointment-editor.scss";
import { lang } from "../../../core/i18/i18";
import { num } from "../../../assets/utils/num";

@observer
export class AppointmentEditor extends React.Component<
	{
		appointment: Appointment | undefined | null;
		onDismiss: () => void;
		onDelete: () => void;
	},
	{}
> {
	@observable timerInputs: number[] = [];

	@computed
	get otherAppointmentsNumber() {
		const appointment = this.props.appointment;
		if (!appointment) {
			return [].length - 1;
		}
		return appointments
			.appointmentsForDay(appointment.date, 0, 0)
			.filter(a => a._id !== appointment._id).length;
	}

	@computed
	get treatmentOptions() {
		const list: Treatment[] = JSON.parse(
			JSON.stringify(treatmentsData.treatments.list)
		);
		if (
			this.props.appointment &&
			this.props.appointment.treatmentID.indexOf("|") > -1
		) {
			const arr = this.props.appointment.treatmentID.split("|");
			const _id = this.props.appointment.treatmentID;
			const type = arr[0];
			const expenses = num(arr[1]);
			list.push(new Treatment({ _id, expenses, type }));
		}
		return list;
	}

	@computed
	get canEdit() {
		return API.user.currentUser.canEditAppointments;
	}

	render() {
		return this.props.appointment ? (
			<Panel
				isOpen={!!this.props.appointment}
				type={PanelType.medium}
				closeButtonAriaLabel="Close"
				isLightDismiss={true}
				onDismiss={this.props.onDismiss}
				onRenderNavigation={() => (
					<Row className="panel-heading">
						<Col span={22}>
							<Profile
								secondaryElement={
									<span>
										{dateUtils.unifiedDateFormat(
											this.props.appointment!.date
										)}{" "}
										/{" "}
										{this.props.appointment
											? this.props.appointment.treatment
												? this.props.appointment
														.treatment.type
												: ""
											: ""}
									</span>
								}
								name={this.props.appointment!.patient.name}
								size={3}
							/>
						</Col>
						<Col span={2} className="close">
							<IconButton
								iconProps={{ iconName: "cancel" }}
								onClick={() => {
									this.props.onDismiss();
								}}
							/>
						</Col>
					</Row>
				)}
			>
				<div className="appointment-editor">
					<Section title={lang("Appointment")}>
						<Row gutter={12}>
							<Col sm={12}>
								<div className="appointment-input date">
									<DatePicker
										label={lang("Date")}
										disabled={!this.canEdit}
										className="appointment-date"
										placeholder={lang("Select a date")}
										value={
											new Date(
												this.props.appointment!.date
											)
										}
										onSelectDate={date => {
											if (date) {
												this.props.appointment!.setDate(
													date.getTime()
												);
											}
										}}
										formatDate={d =>
											dateUtils.unifiedDateFormat(d || 0)
										}
									/>
									<p className="insight">
										{lang("With")}{" "}
										<span
											className={
												"num-" +
												this.otherAppointmentsNumber
											}
										>
											{this.otherAppointmentsNumber}
										</span>{" "}
										{lang("other appointment")}
									</p>
								</div>
							</Col>
							<Col sm={12}>
								<div className="appointment-input time">
									<Row gutter={12}>
										<Slider
											label={lang("Time")}
											min={this.props.appointment!.dateFloor.getTime()}
											max={
												this.props.appointment!.dateFloor.getTime() +
												dateUtils.hour * 23.5
											}
											value={this.props.appointment!.date}
											step={dateUtils.minute * 30}
											onChange={val => {
												if (
													val >
													this.props.appointment!.dateFloor.getTime()
												) {
													this.props.appointment!.date = val;
												}
											}}
											showValue={true}
											valueFormat={v =>
												this.props.appointment!
													.formattedTime
											}
											disabled={!this.canEdit}
										/>
									</Row>
								</div>
							</Col>
						</Row>
						<div className="appointment-input date">
							<label>{lang("Operating staff")} </label>
							{staffData.staffMembers.list
								.filter(staff => staff.operates)
								.map(staff => {
									const checked =
										this.props.appointment!.staffID.indexOf(
											staff._id
										) > -1;
									return (
										<Checkbox
											key={staff._id}
											label={staff.name}
											disabled={
												!this.canEdit ||
												(!checked &&
													staff.onDutyDays.indexOf(
														new Date(
															this.props.appointment!.date
														).toLocaleDateString(
															"en-us",
															{
																weekday: "long"
															}
														)
													) === -1)
											}
											checked={checked}
											onChange={(ev, isChecked) => {
												if (isChecked) {
													this.props.appointment!.staffID.push(
														staff._id
													);
												} else {
													this.props.appointment!.staffID.splice(
														this.props.appointment!.staffID.indexOf(
															staff._id
														),
														1
													);
												}
												this.props.appointment!
													.triggerUpdate++;
											}}
										/>
									);
								})}
						</div>
					</Section>

					<Section title={lang("Case Details")}>
						<TextField
							multiline
							disabled={!this.canEdit}
							label={lang("Details")}
							value={this.props.appointment!.notes}
							onChange={(e, value) => {
								this.props.appointment!.notes = value!;
							}}
						/>
						<br />
						<Row gutter={12}>
							<Col sm={12}>
								<div className="appointment-input treatment">
									<Dropdown
										label={lang("Treatment")}
										disabled={!this.canEdit}
										className="treatment-type"
										selectedKey={
											this.props.appointment!.treatmentID
										}
										options={this.treatmentOptions
											.sort((a, b) =>
												a.type.localeCompare(b.type)
											)
											.map(tr => {
												return {
													key: tr._id,
													text: tr.type
												};
											})}
										onChange={(e, newValue) => {
											this.props.appointment!.treatmentID = newValue!.key.toString();
										}}
									/>
								</div>
							</Col>
							<Col sm={12}>
								<div className="appointment-input units-number">
									<TextField
										label={lang("Units number")}
										disabled={!this.canEdit}
										type="number"
										value={this.props.appointment!.units.toString()}
										onChange={(e, newValue) => {
											this.props.appointment!.units = num(
												newValue!
											);
										}}
									/>
								</div>
							</Col>
							<Col span={24}>
								{" "}
								<div className="appointment-input involved-teeth">
									<TagInput
										disabled={!this.canEdit}
										placeholder={lang("Involved teeth")}
										value={this.props.appointment!.involvedTeeth.map(
											x => ({
												key: x.toString(),
												text: x.toString()
											})
										)}
										strict={true}
										options={patientsData.ISOTeethArr.map(
											x => {
												return {
													key: x.toString(),
													text: x.toString()
												};
											}
										)}
										formatText={x =>
											`${x.toString()} - ${
												convert(num(x)).Palmer
											}`
										}
										onChange={newValue => {
											this.props.appointment!.involvedTeeth = newValue.map(
												x => num(x.key)
											);
										}}
									/>
								</div>
							</Col>
						</Row>

						{settingsData.settings.getSetting(
							"module_prescriptions"
						) ? (
							<div>
								<hr className="appointment-hr" />
								<div className="appointment-input prescription">
									<TagInput
										disabled={!this.canEdit}
										className="prescription"
										value={this.props.appointment!.prescriptions.map(
											x => ({
												key: x.id,
												text: x.prescription
											})
										)}
										options={prescriptionsData.prescriptions.list.map(
											this.prescriptionToTagInput
										)}
										onChange={newValue => {
											this.props.appointment!.prescriptions = newValue.map(
												x => ({
													id: x.key,
													prescription: x.text
												})
											);
										}}
										strict={true}
										placeholder={lang("Prescription")}
									/>
								</div>

								<div id="prescription-items">
									<div className="print-heading">
										<h2>{API.user.currentUser.name}</h2>
										<hr />
										<h3>
											Patient:{" "}
											{
												this.props.appointment!.patient
													.name
											}
										</h3>
										<Row>
											<Col span={12}>
												<h4>
													Age:{" "}
													{
														this.props.appointment!
															.patient.age
													}
												</h4>
											</Col>
											<Col span={12}>
												<h4>
													Gender:{" "}
													{this.props.appointment!
														.patient.gender
														? "Female"
														: "Male"}
												</h4>
											</Col>
										</Row>
										<hr />
									</div>
									{this.props.appointment!.prescriptions.map(
										item => {
											return (
												<Row key={item.id}>
													<Col
														span={20}
														className="m-b-5"
													>
														<ProfileSquared
															text={
																item.prescription.split(
																	":"
																)[0]
															}
															onRenderInitials={() => (
																<Icon iconName="pill" />
															)}
															subText={
																item.prescription.split(
																	":"
																)[1]
															}
														/>
													</Col>
													<Col
														span={4}
														style={{
															textAlign: "right"
														}}
													>
														{this.canEdit ? (
															<IconButton
																iconProps={{
																	iconName:
																		"delete"
																}}
																onClick={() => {
																	this.props.appointment!.prescriptions = this.props.appointment!.prescriptions.filter(
																		x =>
																			x.id !==
																			item.id
																	);
																}}
															/>
														) : (
															""
														)}
													</Col>
												</Row>
											);
										}
									)}
								</div>

								{this.props.appointment!.prescriptions
									.length ? (
									<DefaultButton
										onClick={print}
										iconProps={{ iconName: "print" }}
										text={lang("Print prescription")}
									/>
								) : (
									""
								)}
							</div>
						) : (
							""
						)}
					</Section>

					<Section title={lang("Expenses & Price")}>
						<Row gutter={12}>
							<Col sm={16}>
								{settingsData.settings.getSetting(
									"time_tracking"
								) ? (
									<div className="appointment-input time">
										<label>
											{lang(
												"Time (hours, minutes, seconds)"
											)}
										</label>
										<TextField
											className="time-input hours"
											type="number"
											disabled={!this.canEdit}
											value={
												this.formatMillisecondsToTime(
													this.props.appointment!.time
												).hours
											}
											onChange={(e, v) => {
												this.timerInputs[0] = num(v!);
												this.manuallyUpdateTime();
											}}
										/>
										<TextField
											className="time-input minutes"
											type="number"
											disabled={!this.canEdit}
											value={
												this.formatMillisecondsToTime(
													this.props.appointment!.time
												).minutes
											}
											onChange={(e, v) => {
												this.timerInputs[1] = num(v!);
												this.manuallyUpdateTime();
											}}
										/>
										<TextField
											className="time-input seconds"
											type="number"
											disabled={!this.canEdit}
											value={
												this.formatMillisecondsToTime(
													this.props.appointment!.time
												).seconds
											}
											onChange={(e, v) => {
												this.timerInputs[2] = num(v!);
												this.manuallyUpdateTime();
											}}
										/>
										{this.props.appointment!.timer ? (
											<PrimaryButton
												iconProps={{
													iconName: "Timer"
												}}
												disabled={!this.canEdit}
												className="appendage stop"
												text={lang("Stop")}
												onClick={() => {
													const timer = this.props
														.appointment!.timer;
													if (timer) {
														clearInterval(timer);
													}
													this.props.appointment!.timer = null;
												}}
											/>
										) : (
											<PrimaryButton
												iconProps={{
													iconName: "Timer"
												}}
												disabled={!this.canEdit}
												className="appendage"
												text={lang("Start")}
												onClick={() => {
													const i = appointments.getIndexByID(
														this.props.appointment!
															._id
													);
													const appointment =
														appointments.list[i];
													this.props.appointment!.timer = window.setInterval(
														() => {
															appointment.time =
																appointment.time +
																1000;
														},
														1000
													);
												}}
											/>
										)}
										<p className="payment-insight">
											<Tag
												text={
													lang("Time value") +
													": " +
													settingsData.settings.getSetting(
														"currencySymbol"
													) +
													round(
														this.props.appointment!
															.spentTimeValue
													).toString()
												}
												type={TagType.info}
											/>
											<br />
											<Tag
												text={
													lang("Expenses") +
													": " +
													settingsData.settings.getSetting(
														"currencySymbol"
													) +
													round(
														this.props.appointment!
															.expenses
													).toString()
												}
												type={TagType.info}
											/>
										</p>
									</div>
								) : (
									""
								)}
							</Col>
							<Col sm={24}>
								<div className="appointment-input paid">
									<Row gutter={12}>
										<Col sm={8}>
											<TextField
												type="number"
												disabled={!this.canEdit}
												label={lang("Price")}
												value={this.props.appointment!.finalPrice.toString()}
												onChange={(e, newVal) => {
													this.props.appointment!.finalPrice = num(
														newVal!
													);
												}}
												prefix={settingsData.settings.getSetting(
													"currencySymbol"
												)}
											/>
										</Col>
										<Col sm={8}>
											<TextField
												type="number"
												disabled={!this.canEdit}
												label={lang("Paid")}
												value={this.props.appointment!.paidAmount.toString()}
												onChange={(e, newVal) => {
													this.props.appointment!.paidAmount = num(
														newVal!
													);
												}}
												prefix={settingsData.settings.getSetting(
													"currencySymbol"
												)}
											/>
										</Col>
										<Col sm={8}>
											<TextField
												type="number"
												disabled={true}
												label={
													this.props.appointment!
														.outstandingAmount
														? lang("Outstanding")
														: this.props
																.appointment!
																.overpaidAmount
														? lang("Overpaid")
														: lang("Outstanding")
												}
												value={
													this.props.appointment!
														.outstandingAmount
														? this.props.appointment!.outstandingAmount.toString()
														: this.props
																.appointment!
																.overpaidAmount
														? this.props.appointment!.overpaidAmount.toString()
														: this.props.appointment!.outstandingAmount.toString()
												}
												prefix={settingsData.settings.getSetting(
													"currencySymbol"
												)}
											/>
										</Col>
									</Row>
									<p className="payment-insight">
										<Tag
											text={
												lang("Profit") +
												": " +
												settingsData.settings.getSetting(
													"currencySymbol"
												) +
												round(
													this.props.appointment!
														.profit
												).toString()
											}
											type={TagType.success}
										/>
										<br />
										<Tag
											text={
												lang("Profit percentage") +
												": " +
												round(
													this.props.appointment!
														.profitPercentage * 100
												).toString() +
												"%"
											}
											type={TagType.success}
										/>
									</p>
								</div>
							</Col>
						</Row>
						<Row gutter={12}>
							<Col sm={24}>
								<Toggle
									defaultChecked={
										this.props.appointment!.isDone
									}
									onText={lang("Done")}
									offText={lang("Not done")}
									disabled={!this.canEdit}
									onChange={(e, newVal) => {
										this.props.appointment!.isDone = newVal!;
									}}
								/>
							</Col>
						</Row>
					</Section>

					<br />

					{this.canEdit ? (
						<PrimaryButton
							className="delete"
							iconProps={{
								iconName: "delete"
							}}
							text={lang("Delete")}
							onClick={() => {
								const appointment = this.props.appointment;
								appointments.deleteModal(appointment!._id);
								this.props.onDelete();
							}}
						/>
					) : (
						""
					)}

					<br />
					<br />
					<br />
				</div>
			</Panel>
		) : (
			<div />
		);
	}
	formatMillisecondsToTime(ms: number) {
		const msInSecond = 1000;
		const msInMinute = msInSecond * 60;
		const msInHour = msInMinute * 60;
		const hours = Math.floor(ms / msInHour);
		const minutes = Math.floor((ms % msInHour) / msInMinute);
		const seconds = Math.floor(((ms % msInHour) % msInMinute) / msInSecond);
		return {
			hours: padWithZero(hours),
			minutes: padWithZero(minutes),
			seconds: padWithZero(seconds)
		};
		function padWithZero(n: number) {
			return n > 9 ? n.toString() : "0" + n.toString();
		}
	}
	manuallyUpdateTime() {
		const msInSecond = 1000;
		const msInMinute = msInSecond * 60;
		const msInHour = msInMinute * 60;
		const hours = this.timerInputs[0];
		const minutes = this.timerInputs[1];
		const seconds = this.timerInputs[2];
		if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
			return;
		}
		this.props.appointment!.time =
			hours * msInHour + minutes * msInMinute + seconds * msInSecond;
	}
	prescriptionToTagInput(p: prescriptionsData.PrescriptionItem) {
		return {
			key: p._id,
			text: `${p.name}: ${p.doseInMg}${lang("mg")} ${p.timesPerDay}X${
				p.unitsPerTime
			} ${lang(prescriptionsData.itemFormToString(p.form))}`
		};
	}
}
