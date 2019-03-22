import * as React from "react";
import { Persona, PersonaInitialsColor } from "office-ui-fabric-react";
import "./profile-squared.scss";

interface Props {
	text?: string;
	subText?: string;
	onRenderInitials?: () => JSX.Element;
	initialsColor?: PersonaInitialsColor;
	size?: number;
	onClick?: () => void;
}

export class ProfileSquared extends React.Component<Props, {}> {
	render() {
		return (
			<Persona
				className={`profile-squared size-${this.props.size}`}
				text={this.props.text || ""}
				size={this.props.size || 3}
				onRenderInitials={this.props.onRenderInitials}
				secondaryText={this.props.subText}
				onClick={this.props.onClick}
				initialsColor={this.props.initialsColor}
			/>
		);
	}
}
