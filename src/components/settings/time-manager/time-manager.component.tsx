import { Component, ReactNode } from "react";

import "./time-manager.css";

import editImg from "/icons/edit.svg";
import checkImg from "/icons/check.svg";
import failedImg from "/icons/failed.svg";
import trashImg from "/trash.svg";

import { cssClass, Log } from "../../../utils";
import { Owlbear } from "../../../owlbear";
import { Task, TimeInfo } from "../../../model";

import { ImgButton, moonIcons, spaceEvenly } from "../../ui";

type Props = object;
interface State {
  gm: boolean;
  edit: boolean;
  editTask: EditTask;
  timeInfo: TimeInfo;
}
interface EditTask {
  key: string;
  tempTask?: Task;
  originalTask?: Task;
}

export class TimeManager extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      gm: false,
      edit: false,
      editTask: {
        key: "",
      },
      timeInfo: {
        gameDay: 1,
        tasks: [],
      },
    };
  }

  protected unSubscribeMetaListener?: () => void;
  async componentDidMount(): Promise<void> {
    await this.setGM(await Owlbear.isGM());
    await this.setTimeInfo(await Owlbear.time.load());
    this.unSubscribeMetaListener = await Owlbear.time.registerOnUpdate(
      async (timeInfo) => this.setTimeInfo(timeInfo)
    );
  }

  componentWillUnmount(): void {
    this.unSubscribeMetaListener?.();
  }

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  get gm(): boolean {
    return this.state.gm;
  }
  protected async setGM(gm: boolean): Promise<void> {
    await this.setStatePromise({ ...this.state, gm });
  }

  get edit(): boolean {
    return this.state.edit;
  }
  protected async setEdit(edit: boolean): Promise<void> {
    await this.setStatePromise({ ...this.state, edit });
  }

  get editTask(): EditTask {
    return this.state.editTask;
  }
  protected async setEditTask(editTask: EditTask): Promise<void> {
    await this.setStatePromise({ ...this.state, editTask });
  }

  get timeInfo(): TimeInfo {
    return this.state.timeInfo;
  }
  protected async setTimeInfo(timeInfo: TimeInfo): Promise<void> {
    await this.setStatePromise({ ...this.state, timeInfo });
  }

  get gameDay(): number {
    return this.state.timeInfo.gameDay;
  }
  protected async setGameDay(gameDay: number): Promise<void> {
    await this.setStatePromise({
      ...this.state,
      timeInfo: { ...this.state.timeInfo, gameDay },
    });
  }

  get tasks(): Task[] {
    return this.state.timeInfo.tasks;
  }
  protected async setTasks(tasks: Task[]): Promise<void> {
    await this.setStatePromise({
      ...this.state,
      timeInfo: { ...this.state.timeInfo, tasks },
    });
  }

  // handler
  async modGameDay(mod: number): Promise<void> {
    const newDay = this.gameDay + mod;
    await this.setGameDay(newDay);
    await Owlbear.time.save(this.timeInfo);
  }

  async succeedTask(task: Task): Promise<void> {
    task.open = false;
    task.failed = false;
    await this.updateTasks();
  }

  async failTask(task: Task): Promise<void> {
    task.open = false;
    task.failed = true;
    await this.updateTasks();
  }

  async openTask(task: Task): Promise<void> {
    task.open = true;
    task.failed = false;
    await this.updateTasks();
  }

  async deleteTask(task: Task): Promise<void> {
    // ask
    if (!confirm("Delete Task")) return;

    // delete
    const idx = this.tasks.findIndex((t) => t == task);
    if (idx == -1) Log.error("TimeManager:deleteTask", "unkown Task", task);
    this.tasks.splice(idx, 1);
    await this.updateTasks();
  }

  async newTask(): Promise<void> {
    // check
    if (
      !this.newTaskFormElement ||
      !this.newTaskNameElement ||
      !this.newTaskTimespanElement
    ) {
      Log.error("TimeManager:newTask", "Refs are not defined");
      return;
    }
    if (!this.newTaskFormElement.reportValidity()) {
      return;
    }

    // create
    const newTask: Task = {
      name: this.newTaskNameElement.value,
      begin: this.gameDay,
      timespan: Number(this.newTaskTimespanElement.value),
      failed: false,
      open: true,
    };
    this.tasks.push(newTask);
    await this.updateTasks();

    // reset
    this.newTaskNameElement.value = "";
    this.newTaskTimespanElement.value = "0";
  }

  async updateTasks(): Promise<void> {
    const newTasks = [...this.tasks];
    await this.setTasks(newTasks);
    await Owlbear.time.save(this.timeInfo);
  }

  // render
  private newTaskNameElement?: HTMLInputElement | null;
  private newTaskTimespanElement?: HTMLInputElement | null;
  private newTaskFormElement?: HTMLFormElement | null;

  render(): ReactNode {
    const currentPhase = this.calcMoonPhase(this.gameDay);

    return (
      <>
        <div className="time-manager">
          <div className="headline">
            <div className="grow-spacer"></div>
            {this.gm && (
              <ImgButton
                img={editImg}
                alt="Edit"
                onClick={() => this.setEdit(!this.edit)}
                active={this.edit}
              />
            )}
          </div>
          <div className="time"></div>
          <div className="moon">{this.renderMoons(currentPhase)}</div>
          {this.edit && (
            <div className="time-manager">
              <span className="lable">GameDay:</span>
              <span className="time-control">
                {/* // TODO NumberEdit */}
                {spaceEvenly([
                  <span
                    key={`time-control-button-<<<`}
                    className="button"
                    onClick={() => this.modGameDay(-30)}
                  >
                    {"<<<"}
                  </span>,
                  <span
                    key={`time-control-button-<<`}
                    className="button"
                    onClick={() => this.modGameDay(-7)}
                  >
                    {"<<"}
                  </span>,
                  <span
                    key={`time-control-button-<`}
                    className="button"
                    onClick={() => this.modGameDay(-1)}
                  >
                    {"<"}
                  </span>,
                  <span
                    key={`time-control-button-game-time`}
                    className="game-time"
                  >
                    {this.gameDay}
                  </span>,
                  <span
                    key={`time-control-button->`}
                    className="button"
                    onClick={() => this.modGameDay(1)}
                  >
                    {">"}
                  </span>,
                  <span
                    key={`time-control-button->>`}
                    className="button"
                    onClick={() => this.modGameDay(7)}
                  >
                    {">>"}
                  </span>,
                  <span
                    key={`time-control-button->>>`}
                    className="button"
                    onClick={() => this.modGameDay(30)}
                  >
                    {">>>"}
                  </span>,
                ])}
              </span>
            </div>
          )}
          <div className="tasks">
            <div className="open-tasks-lable tasks-lable">Open Tasks</div>
            <div className="open-tasks">{this.renderTasks(true)}</div>
            <div className="close-tasks-lable tasks-lable">Closed Tasks</div>
            <div className="close-tasks">{this.renderTasks(false)}</div>
            <div className="new-tasks-lable tasks-lable">New Task</div>
            <div className="new-tasks">
              <form
                ref={(el) => {
                  this.newTaskFormElement = el;
                }}
                onSubmit={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.debug("submit");
                  this.newTask();
                }}
              >
                <input
                  ref={(el) => {
                    this.newTaskNameElement = el;
                  }}
                  className="new-task-name"
                  type="text"
                  defaultValue={""}
                  minLength={3}
                />
                <input
                  ref={(el) => {
                    this.newTaskTimespanElement = el;
                  }}
                  className="new-task-timespan"
                  type="number"
                  defaultValue={0}
                  min={1}
                />
                <ImgButton
                  img={editImg}
                  alt="Edit"
                  onClick={() => this.newTask()}
                />
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  private renderMoons(current: number): ReactNode {
    const moons: ReactNode[] = [];
    const spacerArray: number[] = [0, 6, 12, 16, 18, 20, 13];
    for (let idx = 1; idx < 14; idx++) {
      const spacerIdx = 6 - Math.abs(7 - idx);
      const middle = idx == 7;
      moons.push(
        <div
          className={cssClass({
            "moon-phase": true,
            "moon-phase-active": idx == current || (middle && 0 == current),
          })}
          key={`moon-phase-${idx}`}
        >
          <div className="grow-spacer"></div>
          <div className={cssClass({ "moon-icon": true })}>
            {moonIcons(idx, idx == current ? "white" : "dimgray")}
          </div>
          {this.renderHeightSpacer(spacerArray[spacerIdx])}
          {middle && (
            <div className={cssClass({ "moon-icon": true })}>
              {moonIcons(0, 0 == current ? "white" : "dimgray")}
            </div>
          )}
        </div>
      );
    }
    return spaceEvenly(moons);
  }

  private renderHeightSpacer(n: number): ReactNode[] {
    const randKey = Math.random();
    const heightSpacer: ReactNode[] = [];
    for (let idx = 0; idx < n; idx++) {
      heightSpacer.push(
        <div
          key={`height-spacer-${randKey}-${idx}`}
          className="height-spacer"
        ></div>
      );
    }
    return heightSpacer;
  }

  private renderTasks(open: boolean): ReactNode {
    return (
      <ul className="task-list">
        {this.getTasks(open).map((task, idx) => (
          <li key={`${open ? "open" : "close"}-task-list-item-${idx}`}>
            {this.renderTask(task, `${open ? "open" : "close"}-task-${idx}`)}
          </li>
        ))}
      </ul>
    );
  }

  private renderTask(task: Task, key: string): ReactNode {
    const endTime = task.begin + task.timespan;
    const openDays = endTime - this.gameDay;
    const openWeeks = Math.floor(openDays / 7);
    if (this.editTask.key != key)
      return (
        <div
          className={cssClass({
            task: true,
            open: task.open,
            failed: task.failed,
          })}
          key={key}
        >
          <span className={cssClass({ "task-name": true, edit: this.edit })}>
            {task.name}
          </span>
          <span className="task-time">
            {openWeeks < 0
              ? "past"
              : openWeeks == 0
              ? "< 1 Week"
              : `> ${openWeeks} Weeks`}
          </span>
          {this.edit && (
            <span className="task-control">
              {spaceEvenly([
                <ImgButton
                  key={`task-control-success`}
                  img={checkImg}
                  alt="Success"
                  onClick={() =>
                    task.open ? this.succeedTask(task) : this.openTask(task)
                  }
                  active={!task.open && !task.failed}
                />,
                <ImgButton
                  key={`task-control-fail`}
                  img={failedImg}
                  alt="Fail"
                  onClick={() =>
                    !task.failed ? this.failTask(task) : this.succeedTask(task)
                  }
                  active={task.failed}
                />,
                <ImgButton
                  key={`task-control-edit`}
                  img={editImg}
                  alt="Edit"
                  onClick={() =>
                    this.setEditTask({
                      key,
                      originalTask: task,
                      tempTask: task,
                    })
                  }
                  active={this.editTask.key == key}
                />,
                <ImgButton
                  key={`task-control-delete`}
                  img={trashImg}
                  alt="Delete"
                  onClick={() => this.deleteTask(task)}
                />,
              ])}
            </span>
          )}
        </div>
      );
    else {
      return (
        <div
          className={cssClass({
            task: true,
            open: task.open,
            failed: task.failed,
          })}
          key={key}
        >
          <input
            className="task-name edit"
            type="text"
            value={this.editTask.tempTask?.name}
            onChange={(e) => {
              this.editTask.tempTask!.name = e.target.value;
              this.setEditTask({ ...this.editTask });
            }}
          />
          <span className="task-time-edit">
            <span>Begin:</span>
            <input
              type="number"
              value={this.editTask.tempTask?.begin}
              onChange={(e) => {
                this.editTask.tempTask!.begin = Number(e.target.value);
                this.setEditTask({ ...this.editTask });
              }}
            />
            <span>Timespan:</span>
            <input
              type="number"
              value={this.editTask.tempTask?.timespan}
              onChange={(e) => {
                this.editTask.tempTask!.timespan = Number(e.target.value);
                this.setEditTask({ ...this.editTask });
              }}
            />
          </span>
          {this.edit && (
            <span className="task-control">
              {spaceEvenly([
                <ImgButton
                  key={`task-control-edit`}
                  img={editImg}
                  alt="Edit"
                  onClick={() => {
                    // overwrite all values in original
                    Object.entries(this.editTask.tempTask ?? {}).map(
                      ([key, value]) => {
                        if (this.editTask.originalTask) {
                          this.editTask.originalTask[key as keyof Task] =
                            value as never;
                        }
                      }
                    );

                    // save
                    this.editTask.key = "";
                    this.updateTasks();
                  }}
                  active={this.editTask.key == key}
                />,
              ])}
            </span>
          )}
        </div>
      );
    }
  }

  // helper
  private calcMoonPhase(day: number): number {
    const moonCricle = 28;
    const circleDay = day % moonCricle;

    if (circleDay == 0) return 0;
    if (circleDay == moonCricle / 2) return 7;

    const waning = circleDay > moonCricle / 2;
    const circleDayOffset = Math.abs(moonCricle / 2 - circleDay); // use offset so that uneven timespans are at a symetric position
    const daysPerPhase = (moonCricle - 2) / 2 / (12 / 2);
    const phase = Math.ceil(circleDayOffset / daysPerPhase);

    if (waning) return 7 + phase;
    return 7 - phase;
  }

  private getTasks(open: boolean): Task[] {
    return this.tasks.filter((task) => {
      const isOpen = task.open && !task.failed;
      if (open) return isOpen;
      return !isOpen;
    });
  }
}
