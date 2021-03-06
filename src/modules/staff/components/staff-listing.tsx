import * as dateUtils from "../../../assets/utils/date";
import * as React from "react";
import { API } from "../../../core";
import { appointmentsData } from "../../appointments";
import { AppointmentsList } from "../../../assets/components/appointments-list/appointments-list";
import { Col, Row } from "../../../assets/components/grid/index";
import {
	IconButton,
	Panel,
	PanelType,
	TextField,
	Toggle,
	MessageBar,
	MessageBarType,
	Checkbox,
	PersonaInitialsColor,
	Icon,
	TooltipHost
} from "office-ui-fabric-react";
import { computed, observable } from "mobx";
import { DataTable } from "../../../assets/components/data-table/data-table.component";
import { StaffMember, staffMembers } from "../data";
import { observer } from "mobx-react";
import { Profile } from "../../../assets/components/profile/profile";
import { ProfileSquared } from "../../../assets/components/profile/profile-squared";
import { Section } from "../../../assets/components/section/section";
import { settings } from "../../settings/data";
import setting from "../../settings/data/data.settings";
import "./staff-listing.scss";
import { lang } from "../../../core/i18/i18";
import { num } from "../../../assets/utils/num";

@observer
export class StaffListing extends React.Component<{}, {}> {
	@observable selectedId: string = API.router.currentLocation.split("/")[1];
	@observable viewWhich: number = 1;

	@computed get canEdit() {
		return API.user.currentUser.canEditStaff;
	}

	@computed
	get selectedMemberIndex() {
		return staffMembers.getIndexByID(this.selectedId);
	}

	@computed
	get member() {
		return staffMembers.list[this.selectedMemberIndex];
	}

	render() {
		return (
			<div className="staff-component p-15 p-l-10 p-r-10">
				<Row gutter={16}>
					<Col lg={16}>
						<DataTable
							maxItemsOnLoad={15}
							heads={[
								lang("Staff Member"),
								lang("Last/Next Appointment"),
								lang("Contact Details")
							]}
							rows={staffMembers.list.map(member => ({
								id: member._id,
								searchableString: member.searchableString,
								cells: [
									{
										dataValue: member.name,
										component: (
											<div>
												<Profile
													name={member.name}
													secondaryElement={
														<span>
															{
																member
																	.nextAppointments
																	.length
															}{" "}
															{lang(
																"upcoming appointments"
															)}
														</span>
													}
													size={3}
												/>
												<br />
												<TooltipHost
													content={lang(
														"Staff Member Details"
													)}
												>
													<IconButton
														className="action-button"
														iconProps={{
															iconName:
																"DietPlanNotebook"
														}}
														onClick={() => {
															this.selectedId =
																member._id;
															this.viewWhich = 1;
														}}
													/>
												</TooltipHost>

												<TooltipHost
													content={lang(
														"Level and Permission"
													)}
												>
													<IconButton
														className="action-button"
														iconProps={{
															iconName:
																"Permissions"
														}}
														onClick={() => {
															this.selectedId =
																member._id;
															this.viewWhich = 2;
														}}
													/>
												</TooltipHost>

												{API.user.currentUser
													.canViewAppointments ? (
													<TooltipHost
														content={lang(
															"Upcoming Appointments"
														)}
													>
														<IconButton
															className="action-button"
															iconProps={{
																iconName:
																	"Calendar"
															}}
															onClick={() => {
																this.selectedId =
																	member._id;
																this.viewWhich = 3;
															}}
														/>
													</TooltipHost>
												) : (
													""
												)}
												<TooltipHost
													content={lang("Delete")}
												>
													<IconButton
														className="action-button delete"
														iconProps={{
															iconName: "Trash"
														}}
														onClick={() =>
															staffMembers.deleteModal(
																member._id
															)
														}
														disabled={!this.canEdit}
													/>
												</TooltipHost>
											</div>
										),
										className: "no-label"
									},
									{
										dataValue: (
											member.lastAppointment ||
											member.nextAppointment || {
												date: 0
											}
										).date,
										component: (
											<div>
												<ProfileSquared
													text={
														member.lastAppointment
															? member
																	.lastAppointment
																	.treatment
																? member
																		.lastAppointment
																		.treatment
																		.type
																: ""
															: ""
													}
													subText={
														member.lastAppointment
															? dateUtils.unifiedDateFormat(
																	member
																		.lastAppointment
																		.date
															  )
															: lang(
																	"No last appointment"
															  )
													}
													size={3}
													onRenderInitials={() => (
														<Icon iconName="Previous" />
													)}
													onClick={() => {}}
													initialsColor={
														member.lastAppointment
															? undefined
															: PersonaInitialsColor.transparent
													}
												/>
												<br />
												<ProfileSquared
													text={
														member.nextAppointment
															? member
																	.nextAppointment
																	.treatment
																? member
																		.nextAppointment
																		.treatment
																		.type
																: ""
															: ""
													}
													subText={
														member.nextAppointment
															? dateUtils.unifiedDateFormat(
																	member
																		.nextAppointment
																		.date
															  )
															: lang(
																	"No next appointment"
															  )
													}
													size={3}
													onRenderInitials={() => (
														<Icon iconName="Next" />
													)}
													onClick={() => {}}
													initialsColor={
														member.nextAppointment
															? undefined
															: PersonaInitialsColor.transparent
													}
												/>
											</div>
										),
										className: "hidden-xs"
									},
									{
										dataValue: member.phone || member.email,
										component: (
											<div>
												<ProfileSquared
													text={member.phone}
													subText={
														member.phone
															? lang(
																	"Phone number"
															  )
															: lang(
																	"No phone number"
															  )
													}
													size={3}
													onRenderInitials={() => (
														<Icon iconName="Phone" />
													)}
													initialsColor={
														member.phone
															? PersonaInitialsColor.teal
															: PersonaInitialsColor.transparent
													}
												/>
												<ProfileSquared
													text={member.email}
													subText={
														member.email
															? lang("Email")
															: lang("No Email")
													}
													size={3}
													onRenderInitials={() => (
														<Icon iconName="Mail" />
													)}
													initialsColor={
														member.email
															? PersonaInitialsColor.teal
															: PersonaInitialsColor.transparent
													}
												/>
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
												name: lang("Add new"),
												onClick: () => {
													const member = new StaffMember();
													staffMembers.list.push(
														member
													);
													this.selectedId =
														member._id;
													this.viewWhich = 1;
												},
												iconProps: {
													iconName: "Add"
												}
											}
									  ]
									: []
							}
						/>
					</Col>
					<Col lg={8}>
						<table className="ms-table duty-table">
							<tbody>
								{dateUtils.name.days(true).map(dayName => {
									return (
										<tr key={dayName}>
											<th className="day-name">
												{lang(dayName)}
											</th>
											<td>
												{staffMembers.list
													.filter(
														member =>
															member.onDutyDays.indexOf(
																dayName
															) !== -1
													)
													.map(member => {
														return (
															<Profile
																className="m-b-5"
																size={3}
																key={member._id}
																name={
																	member.name
																}
																secondaryElement={
																	<span>
																		{
																			(
																				member
																					.weeksAppointments[
																					dayName
																				] ||
																				[]
																			)
																				.length
																		}{" "}
																		{lang(
																			"appointments for"
																		)}{" "}
																		{lang(
																			dayName
																		)}
																	</span>
																}
																onClick={() => {
																	this.selectedId =
																		member._id;
																}}
															/>
														);
													})}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</Col>
				</Row>

				{this.member && this.viewWhich ? (
					<Panel
						isOpen={!!this.member}
						type={PanelType.medium}
						closeButtonAriaLabel="Close"
						isLightDismiss={true}
						onDismiss={() => {
							this.selectedId = "";
							this.viewWhich = 0;
						}}
						onRenderNavigation={() => (
							<Row className="panel-heading">
								<Col span={20}>
									{this.member.name ? (
										<Profile
											name={this.member.name}
											secondaryElement={
												<span>
													{this.viewWhich === 1
														? lang(
																"Staff Member Details"
														  )
														: ""}
													{this.viewWhich === 2
														? lang(
																"Level and Permission"
														  )
														: ""}
													{this.viewWhich === 3
														? lang(
																"Upcoming Appointments"
														  )
														: ""}
												</span>
											}
											tertiaryText={this.member.phone}
											size={3}
										/>
									) : (
										<p />
									)}
								</Col>
								<Col span={4} className="close">
									<IconButton
										iconProps={{ iconName: "cancel" }}
										onClick={() => {
											this.selectedId = "";
										}}
									/>
								</Col>
							</Row>
						)}
					>
						<div className="staff-editor">
							{this.viewWhich === 1 ? (
								<div>
									<Section title={lang(`Basic Info`)}>
										<div className="staff-input">
											<TextField
												label={lang("Name")}
												value={this.member.name}
												onChange={(ev, val) =>
													(this.member.name = val!)
												}
												disabled={!this.canEdit}
											/>
										</div>

										<div className="staff-input">
											<label>
												{lang("Days on duty")}
											</label>
											{dateUtils.name
												.days(true)
												.map((day, i) => {
													return (
														<Checkbox
															key={day}
															disabled={
																!this.canEdit
															}
															label={
																dateUtils.name.daysShort()[
																	i
																]
															}
															checked={
																this.member.onDutyDays.indexOf(
																	day
																) > -1
															}
															onChange={(
																ev,
																checked
															) => {
																if (checked) {
																	this.member.onDutyDays.push(
																		day
																	);
																} else {
																	this.member.onDutyDays.splice(
																		this.member.onDutyDays.indexOf(
																			day
																		),
																		1
																	);
																}
																this.member
																	.triggerUpdate++;
															}}
														/>
													);
												})}
										</div>
									</Section>

									<Section title={lang(`Contact Details`)}>
										<Row gutter={12}>
											<Col sm={12}>
												<div className="staff-input">
													<TextField
														label={lang(
															"Phone number"
														)}
														value={
															this.member.phone
														}
														onChange={(ev, val) =>
															(this.member.phone = val!)
														}
														disabled={!this.canEdit}
													/>
												</div>
											</Col>
											<Col sm={12}>
												<div className="staff-input">
													<TextField
														label={lang("Email")}
														value={
															this.member.email
														}
														onChange={(ev, val) =>
															(this.member.email = val!)
														}
														disabled={!this.canEdit}
													/>
												</div>
											</Col>
										</Row>
									</Section>
								</div>
							) : (
								""
							)}

							{this.viewWhich === 2 ? (
								<div>
									{this.member._id ===
									API.user.currentUser._id ? (
										<Section title={lang(`Login PIN`)}>
											<div className="staff-input">
												<TextField
													label={lang("Login PIN")}
													value={this.member.pin}
													onChange={(ev, v) => {
														if (num(v!) < 10000) {
															this.member.pin = v!.toString();
														} else {
															this.forceUpdate();
														}
													}}
													onClick={() => {}}
													type="number"
													max={9999}
												/>
											</div>
											<MessageBar
												messageBarType={
													MessageBarType.info
												}
											>
												{lang(
													"Only you can edit this PIN, and it can only be 4 numbers"
												)}
											</MessageBar>
										</Section>
									) : (
										""
									)}
									<Section title={lang(`Permission`)}>
										{this.member._id ===
										API.user.currentUser._id ? (
											<div>
												<MessageBar
													messageBarType={
														MessageBarType.warning
													}
												>
													{lang(
														"You can't edit your own level and permissions"
													)}
												</MessageBar>
												<br />
											</div>
										) : (
											""
										)}
										<Toggle
											defaultChecked={
												this.member.operates
											}
											disabled={
												this.member._id ===
												API.user.currentUser._id
											}
											onText={lang(
												"Operates on patients"
											)}
											offText={lang(
												"Doesn't operate on patients"
											)}
											onChange={(ev, newVal) => {
												this.member.operates = newVal!;
											}}
										/>

										<Toggle
											defaultChecked={
												this.member.canViewStaff
											}
											disabled={
												this.member._id ===
												API.user.currentUser._id
											}
											onText={lang("Can view staff page")}
											offText={lang(
												"Can not view staff page"
											)}
											onChange={(ev, newVal) => {
												this.member.canViewStaff = newVal!;
											}}
										/>
										<Toggle
											defaultChecked={
												this.member.canViewPatients
											}
											disabled={
												this.member._id ===
												API.user.currentUser._id
											}
											onText={lang(
												"Can view patients page"
											)}
											offText={lang(
												"Can not view patients page"
											)}
											onChange={(ev, newVal) => {
												this.member.canViewPatients = newVal!;
											}}
										/>
										{setting.getSetting(
											"module_orthodontics"
										) ? (
											<Toggle
												defaultChecked={
													this.member.canViewOrtho
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can view orthodontics page"
												)}
												offText={lang(
													"Can not view orthodontics page"
												)}
												onChange={(ev, newVal) => {
													this.member.canViewOrtho = newVal!;
												}}
											/>
										) : (
											""
										)}
										<Toggle
											defaultChecked={
												this.member.canViewAppointments
											}
											disabled={
												this.member._id ===
												API.user.currentUser._id
											}
											onText={lang(
												"Can view appointments page"
											)}
											offText={lang(
												"Can not view appointments page"
											)}
											onChange={(ev, newVal) => {
												this.member.canViewAppointments = newVal!;
											}}
										/>
										<Toggle
											defaultChecked={
												this.member.canViewTreatments
											}
											disabled={
												this.member._id ===
												API.user.currentUser._id
											}
											onText={lang(
												"Can view treatments page"
											)}
											offText={lang(
												"Can not view treatments page"
											)}
											onChange={(ev, newVal) => {
												this.member.canViewTreatments = newVal!;
											}}
										/>
										{setting.getSetting(
											"module_prescriptions"
										) ? (
											<Toggle
												defaultChecked={
													this.member
														.canViewPrescriptions
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can view prescriptions page"
												)}
												offText={lang(
													"Can not view prescriptions page"
												)}
												onChange={(ev, newVal) => {
													this.member.canViewPrescriptions = newVal!;
												}}
											/>
										) : (
											""
										)}
										{setting.getSetting(
											"module_statistics"
										) ? (
											<Toggle
												defaultChecked={
													this.member.canViewStats
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can view statistics page"
												)}
												offText={lang(
													"Can not view statistics page"
												)}
												onChange={(ev, newVal) => {
													this.member.canViewStats = newVal!;
												}}
											/>
										) : (
											""
										)}

										<Toggle
											defaultChecked={
												this.member.canViewSettings
											}
											disabled={
												this.member._id ===
												API.user.currentUser._id
											}
											onText={lang(
												"Can view settings page"
											)}
											offText={lang(
												"Can not view settings page"
											)}
											onChange={(ev, newVal) => {
												this.member.canViewSettings = newVal!;
											}}
										/>

										{this.member.canViewStaff ? (
											<Toggle
												defaultChecked={
													this.member.canEditStaff
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can edit staff page"
												)}
												offText={lang(
													"Can not edit staff page"
												)}
												onChange={(ev, newVal) => {
													this.member.canEditStaff = newVal!;
												}}
											/>
										) : (
											""
										)}
										{this.member.canViewPatients ? (
											<Toggle
												defaultChecked={
													this.member.canEditPatients
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can edit patients page"
												)}
												offText={lang(
													"Can not edit patients page"
												)}
												onChange={(ev, newVal) => {
													this.member.canEditPatients = newVal!;
												}}
											/>
										) : (
											""
										)}

										{settings.getSetting(
											"module_orthodontics"
										) && this.member.canViewOrtho ? (
											<Toggle
												defaultChecked={
													this.member.canEditOrtho
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can edit orthodontics page"
												)}
												offText={lang(
													"Can not edit orthodontics page"
												)}
												onChange={(ev, newVal) => {
													this.member.canEditOrtho = newVal!;
												}}
											/>
										) : (
											""
										)}

										{this.member.canViewAppointments ? (
											<Toggle
												defaultChecked={
													this.member
														.canEditAppointments
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can edit appointments page"
												)}
												offText={lang(
													"Can not edit appointments page"
												)}
												onChange={(ev, newVal) => {
													this.member.canEditAppointments = newVal!;
												}}
											/>
										) : (
											""
										)}

										{this.member.canViewTreatments ? (
											<Toggle
												defaultChecked={
													this.member
														.canEditTreatments
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can edit treatments page"
												)}
												offText={lang(
													"Can not edit treatments page"
												)}
												onChange={(ev, newVal) => {
													this.member.canEditTreatments = newVal!;
												}}
											/>
										) : (
											""
										)}

										{setting.getSetting(
											"module_prescriptions"
										) &&
										this.member.canViewPrescriptions ? (
											<Toggle
												defaultChecked={
													this.member
														.canEditPrescriptions
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can edit prescriptions page"
												)}
												offText={lang(
													"Can not edit prescriptions page"
												)}
												onChange={(ev, newVal) => {
													this.member.canEditPrescriptions = newVal!;
												}}
											/>
										) : (
											""
										)}

										{this.member.canViewSettings ? (
											<Toggle
												defaultChecked={
													this.member.canEditSettings
												}
												disabled={
													this.member._id ===
													API.user.currentUser._id
												}
												onText={lang(
													"Can edit settings page"
												)}
												offText={lang(
													"Can not edit settings page"
												)}
												onChange={(ev, newVal) => {
													this.member.canEditSettings = newVal!;
												}}
											/>
										) : (
											""
										)}
									</Section>
								</div>
							) : (
								""
							)}

							{this.viewWhich === 3 ? (
								<Section title={lang(`Upcoming Appointments`)}>
									{this.member.nextAppointments.length ? (
										<AppointmentsList
											list={this.member.nextAppointments}
										/>
									) : (
										<MessageBar
											messageBarType={MessageBarType.info}
										>
											{lang(
												"There are no upcoming appointments for this staff member"
											)}
										</MessageBar>
									)}
								</Section>
							) : (
								""
							)}
						</div>
					</Panel>
				) : (
					""
				)}
			</div>
		);
	}
}
