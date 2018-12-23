import React from "react";
import ReactDOM from "react-dom";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import "./styles.css";

class TodoParent extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmitTodo = this.handleSubmitTodo.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDeleteToDo = this.handleDeleteToDo.bind(this);
    this.handleDeleteDone = this.handleDeleteDone.bind(this);
    this.handleDoneItem = this.handleDoneItem.bind(this);
    this.handleUndoItem = this.handleUndoItem.bind(this);
    this.state = {
      inputValue: "",
      toDos: [],
      dones: [],
      error: ""
    };
  }

  componentDidMount() {
    if (this.state.inputValue.length < 1) {
      const savedToDos = JSON.parse(localStorage.getItem("toDos"));
      if (!!savedToDos) {
        this.setState({ toDos: savedToDos });
      } else {
        this.setState({ toDos: [] });
      }
      const savedDones = JSON.parse(localStorage.getItem("dones"));
      if (!!savedDones) {
        this.setState({ dones: savedDones });
      } else {
        this.setState({ dones: [] });
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.inputValue === "") {
      const stringifiedToDos = JSON.stringify(this.state.toDos);
      localStorage.setItem("toDos", stringifiedToDos);

      const stringifiedDones = JSON.stringify(this.state.dones);
      localStorage.setItem("dones", stringifiedDones);
    }
  }

  handleSubmitTodo(e) {
    e.preventDefault();
    const toDoAdded = {
      id: Date.now().toString(),
      text: this.state.inputValue
    };
    let toDoTexts = [];
    this.state.toDos.map(toDo => (toDoTexts = toDoTexts.concat(toDo.text)));

    let doneTexts = [];
    this.state.dones.map(toDo => (doneTexts = doneTexts.concat(toDo.text)));

    if (
      toDoTexts.indexOf(toDoAdded.text) > -1 ||
      doneTexts.indexOf(toDoAdded.text) > -1
    ) {
      this.setState({ error: "This element already exists" });
    } else {
      this.setState(prevState => ({
        toDos: prevState.toDos.concat(toDoAdded)
      }));
      this.setState({ error: "" });
      this.setState({ inputValue: "" });
    }
  }

  handleInputChange(e) {
    this.setState({ inputValue: e.target.value });
  }

  handleDeleteToDo(itemText) {
    this.setState(prevState => ({
      toDos: prevState.toDos.filter(toDo => toDo.text !== itemText)
    }));
  }

  handleDoneItem(itemText, itemKey) {
    const doneAdded = {
      text: itemText,
      id: itemKey
    };

    this.setState(prevState => ({
      dones: prevState.dones.concat(doneAdded)
    }));

    this.handleDeleteToDo(itemText);
  }

  handleDeleteDone(itemText) {
    this.setState(prevState => ({
      dones: prevState.dones.filter(done => done.text !== itemText)
    }));
  }

  handleUndoItem(itemText, itemKey) {
    const toUndo = {
      text: itemText,
      id: itemKey
    };

    this.setState(prevState => ({
      toDos: prevState.toDos.concat(toUndo)
    }));

    this.handleDeleteDone(itemText);
  }

  render() {
    return (
      <div>
        <CreateTodo
          inputValue={this.state.inputValue}
          handleSubmitTodo={this.handleSubmitTodo}
          handleInputChange={this.handleInputChange}
        />
        <ErrorMessage error={this.state.error} />
        <TodoList
          toDos={this.state.toDos}
          handleDeleteToDo={this.handleDeleteToDo}
          handleDoneItem={this.handleDoneItem}
        />
        <DoneList
          dones={this.state.dones}
          handleDoneItem={this.handleDoneItem}
          handleDeleteDone={this.handleDeleteDone}
          handleUndoItem={this.handleUndoItem}
        />
      </div>
    );
  }
}

class CreateTodo extends React.Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmitTodo}>
        <input
          type="text"
          id="createTodo"
          name="createTodo"
          placeholder="Create To Do"
          onChange={this.props.handleInputChange}
          value={this.props.inputValue}
        />
        <button type="submit" disabled={!this.props.inputValue}>
          Add
        </button>
      </form>
    );
  }
}

class ErrorMessage extends React.Component {
  render() {
    if (!this.props.error) {
      return null;
    }
    return <p className="error-message">{this.props.error}</p>;
  }
}

class TodoList extends React.Component {
  renderToDos() {
    if (this.props.toDos.length > 0) {
      return (
        <ul>
          {this.props.toDos.map(toDo => (
            <SingleTodo
              key={toDo.id}
              identifier={toDo.id}
              text={toDo.text}
              handleDeleteToDo={this.props.handleDeleteToDo}
              handleDoneItem={this.props.handleDoneItem}
            />
          ))}
        </ul>
      );
    } else {
      return <p>You're all done!</p>;
    }
  }
  render() {
    return (
      <div>
        <h2 className="blue">To Do List</h2>
        {this.renderToDos()}
      </div>
    );
  }
}

class SingleTodo extends React.Component {
  render() {
    return (
      <ReactCSSTransitionGroup
        transitionName="anim"
        transitionAppear={true}
        transitionAppearTimeout={300}
        transitionEnter={false}
        transitionLeave={false}
      >
        <li id={this.props.identifier}>
          <span>{this.props.text}</span>
          <button
            className="mark-done"
            onClick={() => {
              this.props.handleDoneItem(this.props.text, this.props.identifier);
            }}
          >
            Done
          </button>
          <button
            className="delete"
            onClick={() => {
              this.props.handleDeleteToDo(this.props.text);
            }}
          >
            Delete
          </button>
        </li>
      </ReactCSSTransitionGroup>
    );
  }
}

class DoneList extends React.Component {
  renderDones() {
    if (this.props.dones.length > 0) {
      return (
        <ul className="done-list">
          {this.props.dones.map(done => (
            <SingleDone
              key={done.id}
              identifier={done.id}
              text={done.text}
              handleDoneItem={this.props.handleDoneItem}
              handleDeleteDone={this.props.handleDeleteDone}
              handleUndoItem={this.props.handleUndoItem}
            />
          ))}
        </ul>
      );
    } else {
      return <p>Nothing done yet...</p>;
    }
  }
  render() {
    return (
      <div>
        <h2 className="green">Done List</h2>
        {this.renderDones()}
      </div>
    );
  }
}

class SingleDone extends React.Component {
  render() {
    return (
      <ReactCSSTransitionGroup
        transitionName="anim"
        transitionAppear={true}
        transitionAppearTimeout={300}
        transitionEnter={false}
        transitionLeave={false}
      >
        <li id={this.props.identifier}>
          <span>{this.props.text}</span>
          <button
            className="mark-undone"
            onClick={() => {
              this.props.handleUndoItem(this.props.text, this.props.identifier);
            }}
          >
            Not done
          </button>
          <button
            className="delete"
            onClick={() => {
              this.props.handleDeleteDone(this.props.text);
            }}
          >
            Delete
          </button>
        </li>
      </ReactCSSTransitionGroup>
    );
  }
}

function App() {
  return (
    <div className="App">
      <TodoParent />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
