import * as React from "react";
import { data } from "../../modules";
import { PrimaryButton, TextField } from "office-ui-fabric-react";
import { login } from "./data.login";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Profile } from "../../assets/components/profile/profile";
import "./login.scss";
import { lang } from "../i18/i18";
import { Message } from "../messages/class.message";
import messages from "../messages/data.messages";
import { modals } from "../modal/data.modal";

@observer
export class ChooseUser extends React.Component<{}, {}> {
	@observable newDocName: string = "";
	render() {
		return (
			<div className="login-component">
				<div className="m-b-5">
					{data.staffData.staffMembers.list.map(user => (
						<div
							className="m-t-5 p-5 user-chooser pointer"
							onClick={() => {
								if (user.pin) {
									modals.newModal({
										id: Math.random(),
										message: lang("Please enter your PIN"),
										onConfirm: providedPin => {
											if (providedPin === user.pin) {
												login.setUser(user._id);
											} else {
												const msg = new Message(
													lang("Invalid PIN provided")
												);
												messages.addMessage(msg);
											}
										},
										input: true,
										showCancelButton: true,
										showConfirmButton: true
									});
								} else {
									login.setUser(user._id);
								}
							}}
							key={user._id}
						>
							<Profile
								size={3}
								name={user.name}
								secondaryElement={
									<span>{user.sortedDays.join(", ")}</span>
								}
							/>
						</div>
					))}
				</div>
				<hr />
				{data.staffData.staffMembers.list.length === 0 ? (
					<div>
						<TextField
							value={this.newDocName}
							onChange={(ev, v) => (this.newDocName = v!)}
							label={lang("Register as new staff member")}
						/>
						<PrimaryButton
							onClick={() => {
								const newDoc = new data.staffData.StaffMember();
								newDoc.name = this.newDocName;
								this.newDocName = "";
								data.staffData.staffMembers.list.push(newDoc);
								login.setUser(newDoc._id);
							}}
							text={lang("Register")}
						/>
					</div>
				) : (
					""
				)}
			</div>
		);
	}
}
