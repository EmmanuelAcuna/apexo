import * as React from "react";
import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import * as ImageEditor from "react-avatar-editor";
import {
	Slider,
	Toggle,
	IconButton,
	Dialog,
	CommandBar
} from "office-ui-fabric-react";
import { Row, Col } from "../grid";
import "./crop.scss";
import { GridTable } from "../../../modules/orthodontic/components/grid-table";
import { lang } from "../../../core/i18/i18";
import { generateID } from "../../utils/generate-id";
const Editor = ImageEditor.default || ImageEditor;

const MAX_ZOOM = 5;
const MIN_ZOOM = 0.3;

@observer
export class Crop extends React.Component<{
	src: string;
	prevSrc: string;
	onDismiss: () => void;
	onSave: (src: string) => void;
}> {
	@observable unique: string = generateID(20).replace(/[^a-z]/g, "");

	@observable overlay: boolean = false;
	@observable zoom: number = 1;
	@observable baseRotation: number = 1;
	@observable addedRotation: number = 1;
	@observable showGrid: boolean = true;
	render() {
		return (
			<div className="crop-modal">
				<Dialog
					modalProps={{ className: "crop-dialog" }}
					hidden={false}
					onDismiss={() => this.props.onDismiss()}
				>
					<div className="editor">
						{this.showGrid ? <GridTable /> : ""}
						{this.overlay ? (
							<img
								src={this.props.prevSrc}
								className="prev-overlay"
							/>
						) : (
							""
						)}
						<Editor
							className={this.unique}
							image={this.props.src}
							width={280}
							height={530}
							color={[0, 0, 0, 0.6]}
							scale={this.zoom}
							rotate={this.baseRotation + this.addedRotation}
							border={0}
						/>
					</div>

					<div className="crop-controls">
						<Row gutter={0}>
							<Col span={12}>
								<Row gutter={0}>
									<Col span={16}>
										<Slider
											min={MIN_ZOOM * 100}
											max={MAX_ZOOM * 100}
											value={this.zoom * 100}
											defaultValue={this.zoom * 100}
											onChange={v => {
												this.zoom = v / 100;
											}}
											label={lang(`Zoom`)}
											showValue={false}
										/>
									</Col>
									<Col span={4}>
										<IconButton
											onClick={() => {
												const canvas = document.querySelectorAll(
													"." + this.unique
												)[0] as HTMLCanvasElement;

												const context = canvas.getContext(
													"2d"
												);

												context!.translate(
													context!.canvas.width,
													0
												);
												context!.scale(-1, 1);
												this.forceUpdate();
											}}
											iconProps={{
												iconName: "More"
											}}
										/>
									</Col>
									<Col span={4}>
										<IconButton
											onClick={() => {
												const canvas = document.querySelectorAll(
													"." + this.unique
												)[0] as HTMLCanvasElement;

												const context = canvas.getContext(
													"2d"
												);

												context!.translate(
													0,
													context!.canvas.height
												);
												context!.scale(1, -1);
												this.forceUpdate();
											}}
											iconProps={{
												iconName: "MoreVertical"
											}}
										/>
									</Col>
								</Row>
							</Col>
							<Col span={12}>
								<Row gutter={0}>
									<Col span={16}>
										<Slider
											min={-45}
											max={45}
											value={this.addedRotation}
											defaultValue={this.addedRotation}
											onChange={v => {
												if (v !== -1) {
													this.addedRotation = v;
												}
											}}
											label={lang(`Rotation`)}
											showValue={false}
										/>
									</Col>
									<Col span={4}>
										<IconButton
											onClick={() => {
												this.baseRotation =
													this.baseRotation - 90;
											}}
											iconProps={{
												iconName: "Rotate90Clockwise"
											}}
										/>
									</Col>
									<Col span={4}>
										<IconButton
											onClick={() => {
												this.baseRotation =
													this.baseRotation + 90;
											}}
											iconProps={{
												iconName:
													"Rotate90CounterClockwise"
											}}
										/>
									</Col>
								</Row>
							</Col>
						</Row>
					</div>

					<CommandBar
						items={[
							{
								key: "grid",
								text: lang("Grid"),
								iconProps: { iconName: "GridViewSmall" },
								className: this.showGrid
									? "active-button"
									: undefined,
								active: true,
								onClick: () => {
									this.showGrid = !this.showGrid;
								}
							},
							{
								key: "overlay",
								text: lang("Overlay"),
								iconProps: { iconName: "MapLayers" },
								className: this.overlay
									? "active-button"
									: undefined,
								onClick: () => {
									this.overlay = !this.overlay;
								},
								hidden: !this.props.prevSrc
							}
						]}
						farItems={[
							{
								key: "save",
								text: lang("Save"),
								iconProps: { iconName: "save" },
								classNames: "abc",
								onClick: () => {
									const canvas = document.querySelectorAll(
										"." + this.unique
									)[0] as HTMLCanvasElement;
									this.props.onSave(canvas.toDataURL());
								}
							},
							{
								key: "cancel",
								text: lang("Cancel"),
								iconProps: { iconName: "cancel" },
								classNames: "abc",
								onClick: () => {
									this.props.onDismiss();
								}
							}
						]}
					/>
				</Dialog>
			</div>
		);
	}
}
