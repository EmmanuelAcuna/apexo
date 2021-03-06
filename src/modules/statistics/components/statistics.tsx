import "./statistics.scss";

import * as React from "react";

import { Tag, TagType } from "../../../assets/components/label/label.component";
import { DatePicker, Dropdown } from "office-ui-fabric-react";
import { Row, Col } from "../../../assets/components/grid/index";
import { observer } from "mobx-react";
import { round } from "../../../assets/utils/round";
import { statistics } from "../data";
import { data } from "../../";
import { Section } from "../../../assets/components/section/section";
import { lang } from "../../../core/i18/i18";
import { DataTable } from "../../../assets/components/data-table/data-table.component";
import { Profile } from "../../../assets/components/profile/profile";
import * as dateUtils from "../../../assets/utils/date";
import { AppointmentEditor } from "../../appointments/components";
import { Appointment } from "../../appointments/data";
import { observable } from "mobx";
import { Calendar } from "../../appointments/data/data.calendar";
import { ProfileSquared } from "../../../assets/components/profile/profile-squared";

@observer
export class StatisticsComponent extends React.Component<{}, {}> {
	@observable appointment: Appointment | null = null;

	render() {
		return (
			<div className="statistics-component p-15 p-l-10 p-r-10">
				<DataTable
					maxItemsOnLoad={15}
					className={"appointments-data-table"}
					heads={[
						lang("Appointment"),
						lang("Treatment"),
						lang("Paid"),
						lang("Outstanding"),
						lang("Expenses"),
						lang("Profits")
					]}
					rows={statistics.selectedAppointments.map(appointment => ({
						id: appointment._id,
						searchableString: appointment.searchableString,
						cells: [
							{
								dataValue: appointment.patient.name,
								component: (
									<Profile
										secondaryElement={
											<span>
												{dateUtils.unifiedDateFormat(
													appointment.date
												)}{" "}
												/{" "}
												{appointment.operatingStaff.map(
													x => (
														<i key={x._id}>
															{x.name}{" "}
														</i>
													)
												)}
											</span>
										}
										name={appointment!.patient.name}
										size={3}
									/>
								),
								onClick: () => {
									this.appointment = appointment;
								},
								className: "no-label"
							},
							{
								dataValue: appointment.treatmentID,
								component: (
									<ProfileSquared
										text={
											appointment.treatment
												? appointment.treatment.type
												: ""
										}
										subText={dateUtils.unifiedDateFormat(
											appointment.date
										)}
										size={3}
										onClick={() => {}}
									/>
								),
								className: "hidden-xs"
							},
							{
								dataValue: appointment.paidAmount,
								component: (
									<span>
										{data.settingsData.settings.getSetting(
											"currencySymbol"
										) +
											round(
												appointment.paidAmount
											).toString()}
									</span>
								),
								className: "hidden-xs"
							},
							{
								dataValue: appointment.outstandingAmount,
								component: (
									<span>
										{data.settingsData.settings.getSetting(
											"currencySymbol"
										) +
											round(
												appointment.outstandingAmount
											).toString()}
									</span>
								),
								className: "hidden-xs"
							},
							{
								dataValue: appointment.expenses,
								component: (
									<span>
										{data.settingsData.settings.getSetting(
											"currencySymbol"
										) +
											round(
												appointment.expenses
											).toString()}
									</span>
								),
								className: "hidden-xs"
							},
							{
								dataValue: appointment.profit,
								component: (
									<span>
										{data.settingsData.settings.getSetting(
											"currencySymbol"
										) +
											round(
												appointment.profit
											).toString()}
									</span>
								),
								className: "hidden-xs"
							}
						]
					}))}
					farItems={[
						{
							key: "1",
							onRender: () => {
								return (
									<Dropdown
										placeholder={lang(
											"Filter by staff member"
										)}
										defaultValue=""
										options={[
											{
												key: "",
												text: lang("All members")
											}
										].concat(
											data.staffData.staffMembers.list.map(
												member => {
													return {
														key: member._id,
														text: member.name
													};
												}
											)
										)}
										onChange={(ev, member) => {
											statistics.filterByMember = member!.key.toString();
										}}
									/>
								);
							}
						}
					]}
					hideSearch
					commands={[
						{
							key: "2",
							onRender: () => {
								return (
									<DatePicker
										onSelectDate={date => {
											if (date) {
												statistics.startingDate = statistics.getDayStartingPoint(
													date.getTime()
												);
											}
										}}
										value={
											new Date(statistics.startingDate)
										}
										formatDate={d =>
											`${lang(
												"From"
											)}: ${dateUtils.unifiedDateFormat(
												d
											)}`
										}
									/>
								);
							}
						},
						{
							key: "3",
							onRender: () => {
								return (
									<DatePicker
										onSelectDate={date => {
											if (date) {
												statistics.endingDate = statistics.getDayStartingPoint(
													date.getTime()
												);
											}
										}}
										value={new Date(statistics.endingDate)}
										formatDate={d =>
											`${lang(
												"Until"
											)}: ${dateUtils.unifiedDateFormat(
												d
											)}`
										}
									/>
								);
							}
						}
					]}
				/>

				<AppointmentEditor
					appointment={this.appointment}
					onDismiss={() => (this.appointment = null)}
					onDelete={() => (this.appointment = null)}
				/>

				<div className="container-fluid m-t-20 quick">
					<Section title={lang("Quick stats")}>
						<Row>
							<Col sm={6} xs={12}>
								<label>
									{lang("Appointments")}:{" "}
									<Tag
										text={round(
											statistics.selectedAppointments
												.length
										).toString()}
										type={TagType.primary}
									/>
								</label>
							</Col>
							<Col sm={6} xs={12}>
								<label>
									{lang("Payments")}:{" "}
									<Tag
										text={
											data.settingsData.settings.getSetting(
												"currencySymbol"
											) +
											round(
												statistics.totalPayments
											).toString()
										}
										type={TagType.warning}
									/>
								</label>
							</Col>
							<Col sm={6} xs={12}>
								<label>
									{lang("Expenses")}:{" "}
									<Tag
										text={
											data.settingsData.settings.getSetting(
												"currencySymbol"
											) +
											round(
												statistics.totalExpenses
											).toString()
										}
										type={TagType.danger}
									/>
								</label>
							</Col>
							<Col sm={6} xs={12}>
								<label>
									{lang("Profits")}:{" "}
									<Tag
										text={
											data.settingsData.settings.getSetting(
												"currencySymbol"
											) +
											round(
												statistics.totalProfits
											).toString()
										}
										type={TagType.success}
									/>
								</label>
							</Col>
						</Row>
					</Section>
				</div>

				<div className="charts container-fluid">
					<div className="row">
						{statistics.charts.map((chart, index) => {
							return (
								<div
									key={index + chart.name}
									className={
										"chart-wrapper " +
										(chart.className ||
											"col-xs-12 col-md-5 col-lg-4")
									}
								>
									<Section title={lang(chart.name)}>
										<chart.Component />
									</Section>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	}
}
