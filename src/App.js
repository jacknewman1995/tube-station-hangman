import React from "react";
import tubeData from "./tubedata.js";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "./logo.jpg";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import ReactFitText from "react-fittext";
import "./App.css";

function App() {
  return (
    <>
      <Game />;
    </>
  );
}

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawFunctions: [],
    };
  }

  componentDidMount() {
    let functions = [
      () => this.draw([380, 280], [60, 280]),
      () => this.draw([80, 280], [80, 50]),
      () => this.draw([100, 280], [80, 250]),
      () => this.draw([80, 50], [250, 50]),
      () => this.draw([250, 50], [250, 100]),
      () => this.drawCircle(250, 120, 20),
      () => this.draw([250, 140], [250, 190]),
      () => this.draw([225, 160], [275, 160]),
      () => this.draw([225, 230], [250, 190]),
      () => this.draw([275, 230], [250, 190]),
    ];
    this.setState({
      drawFunctions: functions,
    });
    const ctx = this.refs.canvas.getContext("2d");
    ctx.strokeRect(0, 0, 400, 300);
  }

  draw(moveTo, lineTo) {
    const ctx = this.refs.canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(moveTo[0], moveTo[1]);
    ctx.lineTo(lineTo[0], lineTo[1]);
    ctx.stroke();
  }

  drawCircle(xStart, yStart, radius) {
    const ctx = this.refs.canvas.getContext("2d");
    ctx.moveTo(xStart + radius, yStart);
    ctx.arc(xStart, yStart, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  render() {
    if (this.refs.canvas) {
      const ctx = this.refs.canvas.getContext("2d");
      ctx.clearRect(10, 10, ctx.canvas.width - 20, ctx.canvas.height - 20);
    }
    for (let i = 0; i < this.props.wrongGuesses.length; i++) {
      this.state.drawFunctions[i].call();
    }
    if (this.props.wrongGuesses.length === 10) {
      alert("YOU LOSE!");
      this.props.onLose();
    }
    return <canvas ref="canvas" height="300" width="400" />;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      word: "",
      currentGuess: "",
      wrongGuesses: [],
      guessedWord: [],
      isComplete: false,
      lines: getLines(),
      allLinesDisabled: false,
      gameStarted: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.reset = this.reset.bind(this);
    this.updateLines = this.updateLines.bind(this);
    this.onSelectOrDeselectAllLines = this.onSelectOrDeselectAllLines.bind(
      this
    );
  }

  componentDidMount() {
    if (this.state.gameStarted) {
      let word = this.randomTube();
      this.setState({
        word: word,
        guessedWord: this.getArrayOfBlanks(word.properties.name),
      });
    }
  }

  getArrayOfBlanks(word) {
    let arrayOfBlanks = [];
    word.split("").forEach((x) => {
      if (x === "-" || x === "&") {
        arrayOfBlanks.push(x + " ");
      } else if (x !== " ") {
        arrayOfBlanks.push("__ ");
      } else {
        arrayOfBlanks.push(" / ");
      }
    });
    return arrayOfBlanks;
  }

  randomTube() {
    let availableStations = [];

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].properties.lines.length; j++) {
        if (
          this.state.lines[data[i].properties.lines[j].name].enabled === true
        ) {
          availableStations.push(data[i]);
          break;
        }
      }
    }
    const numberOfStations = availableStations.length;
    return availableStations[Math.floor(Math.random() * numberOfStations)];
  }

  handleChange(event) {
    this.setState({
      currentGuess: event.target.value,
    });
  }

  handleSubmit(event) {
    let stationArray = this.state.word.properties.name.toLowerCase().split("");
    if (stationArray.includes(this.state.currentGuess.toLowerCase())) {
      this.correctGuess(this.state.currentGuess, stationArray);
    } else {
      this.wrongGuess(this.state.currentGuess, stationArray);
    }
    this.setState({
      currentGuess: "",
    });
    event.preventDefault();
    return false;
  }

  correctGuess(guess, stationArray) {
    let updatedGuessedWord = this.state.guessedWord.slice();
    for (let i = 0; i < stationArray.length; i++) {
      if (stationArray[i].toLowerCase() === guess.toLowerCase()) {
        updatedGuessedWord[i] = guess;
      }
    }
    this.setState({
      guessedWord: updatedGuessedWord,
    });
    if (this.isGameWon(updatedGuessedWord)) {
      alert("WINNER WINNER!");
      this.onGameCompleted();
    }
  }

  isGameWon(updatedGuessedWord) {
    return !updatedGuessedWord.includes("__ ");
  }

  wrongGuess(guess, stationArray) {
    let updatedWrongGuesses = this.state.wrongGuesses.slice();
    updatedWrongGuesses.push(guess);
    this.setState({
      wrongGuesses: updatedWrongGuesses,
    });
  }

  onGameCompleted() {
    let word = this.state.word;
    this.setState({
      guessedWord:
        word.properties.name + " (" + this.getLinesForStation(word) + ")",
      wrongGuesses: [],
      isComplete: true,
    });
  }

  getLinesForStation(station) {
    let lines = "";
    for (let i = 0; i < station.properties.lines.length; i++) {
      lines = lines.concat(station.properties.lines[i].name);
      if (i !== station.properties.lines.length - 1) {
        lines = lines.concat(", ");
      }
    }
    return lines;
  }

  reset(event) {
    event.preventDefault();
    if (this.state.allLinesDisabled) {
      this.setState({
        gameStarted: false,
      });
    } else {
      let word = this.randomTube();
      let blankArray = this.getArrayOfBlanks(word.properties.name);
      this.setState({
        word: word,
        currentGuess: "",
        wrongGuesses: [],
        guessedWord: blankArray,
        isComplete: false,
        gameStarted: true,
      });
    }
  }

  updateLines(event) {
    let updatedLine = this.state.lines[event.target.id];
    updatedLine.enabled = event.target.checked;
    let updatedLines = this.state.lines;
    updatedLines[event.target.id] = updatedLine;
    this.setState({
      lines: updatedLines,
      allLinesDisabled: this.areAllLinesDisabled(),
    });
  }

  onSelectOrDeselectAllLines() {
    let updatedLines = this.state.lines;
    for (let i = 0; i < Object.keys(updatedLines).length; i++) {
      if (updatedLines[Object.keys(updatedLines)[i]].enabled === false) {
        this.setAllLines(true);
        return;
      }
    }
    this.setAllLines(false);
  }

  setAllLines(selectAll) {
    let updatedLines = this.state.lines;
    for (let i = 0; i < Object.keys(updatedLines).length; i++) {
      updatedLines[Object.keys(updatedLines)[i]].enabled = selectAll;
    }
    this.setState({
      lines: updatedLines,
      allLinesDisabled: !selectAll,
    });
  }

  areAllLinesDisabled() {
    let updatedLines = this.state.lines;
    for (let i = 0; i < Object.keys(updatedLines).length; i++) {
      if (updatedLines[Object.keys(updatedLines)[i]].enabled === true) {
        return false;
      }
    }
    return true;
  }

  render() {
    return (
      <>
        <div class="container">
          <div class="row">
            <div class="col-md-auto">
              <img src={logo} class="rounded d-block" alt="logo" />
            </div>
            <div class="col align-self-end">
              <StartGameAlert
                allLinesDisabled={this.state.allLinesDisabled}
                gameStarted={this.state.gameStarted}
              />
              <GuessedWord
                allLinesDisabled={this.state.allLinesDisabled}
                guessedWord={this.state.guessedWord}
                gameStarted={this.state.gameStarted}
              />
            </div>
            <div class="col-md-auto align-self-end">
              <Form onSubmit={this.reset}>
                <Button variant="primary" type="Submit">
                  New word
                </Button>
              </Form>
            </div>
          </div>
          <div class="row">
            <div class="col-md-auto pt-3">
              <Canvas
                wrongGuesses={this.state.wrongGuesses}
                onLose={() => this.onGameCompleted()}
              />
            </div>
            <div class="col">
              <Guesses
                handleSubmit={this.handleSubmit}
                handleChange={this.handleChange}
                currentGuess={this.state.currentGuess}
                wrongGuesses={this.state.wrongGuesses}
                isComplete={this.state.isComplete}
                word={this.state.word}
                allLinesDisabled={this.state.allLinesDisabled}
                gameStarted={this.state.gameStarted}
              />
              <div class="py-3">
                <SummaryInfo
                  isComplete={this.state.isComplete}
                  station={this.state.word}
                />
                <LineSelection
                  lines={this.state.lines}
                  onSubmit={this.reset}
                  onChange={this.updateLines}
                  onSelectAll={this.onSelectOrDeselectAllLines}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

class Guesses extends React.Component {
  render() {
    if (!this.props.isComplete) {
      return (
        <>
          <div class="py-3">
            <Form onSubmit={this.props.handleSubmit}>
              <Form.Group>
                <Form.Control
                  type="text"
                  maxLength="1"
                  minLength="1"
                  placeholder="Next guess"
                  value={this.props.currentGuess}
                  onChange={this.props.handleChange}
                  disabled={!this.props.gameStarted}
                ></Form.Control>
              </Form.Group>
              <Button
                variant="primary"
                type="Submit"
                disabled={!this.props.gameStarted}
              >
                Submit
              </Button>
            </Form>
            <font size="4">Wrong guesses: {this.props.wrongGuesses}</font>
          </div>
          <div></div>
        </>
      );
    } else {
      return null;
    }
  }
}

class SummaryInfo extends React.Component {
  render() {
    if (this.props.isComplete) {
      return (
        <>
          <iframe
            width="500"
            height="300"
            frameborder="0"
            title="result"
            src={
              "https://www.google.com/maps/embed/v1/search?q=" +
              this.props.station.geometry.coordinates[1] +
              "," +
              this.props.station.geometry.coordinates[0] +
              "&key=AIzaSyA6cw7TKh0Da4IPxxfWzAXcNLOPGsftWMg"
            }
            allowfullscreen
          ></iframe>
        </>
      );
    }
    return null;
  }
}

class LineSelection extends React.Component {
  createLines(isMainLines) {
    return Object.keys(getLines())
      .filter((x) =>
        isMainLines ? mainLines.includes(x) : !mainLines.includes(x)
      )
      .sort()
      .map((x) => (
        <Form.Check
          inline
          type="checkbox"
          id={x}
          label={x.toString()}
          checked={this.props.lines[x].enabled}
          onChange={this.props.onChange}
        />
      ));
  }

  render() {
    return (
      <div>
        <Form>
          <Form.Label>
            <font size="5">Tube lines to include:</font>
          </Form.Label>
          <Form.Group>
            {/* <Form.Label>Main lines: </Form.Label> */}
            <Form.Row>{this.createLines(true)}</Form.Row>
          </Form.Group>
          <Form.Group>
            {/* <Form.Label>Other lines: </Form.Label> */}
            <Form.Row>{this.createLines(false)}</Form.Row>
          </Form.Group>
          <Button class="btn btn-sm" onClick={this.props.onSelectAll}>
            Select / deselect all
          </Button>
        </Form>
      </div>
    );
  }
}

function getLines() {
  let lines = {};
  data.forEach((x) => {
    let xlines = x.properties.lines.slice();
    for (let i = 0; i < xlines.length; i++) {
      let name = xlines[i].name;
      if (!lines[name]) {
        lines[name] = { enabled: mainLines.includes(name) };
      }
    }
  });
  return lines;
}

class StartGameAlert extends React.Component {
  render() {
    if (!this.props.gameStarted) {
      return (
        <Alert variant="warning">
          Select at least 1 tube line and click 'New word' to start the game
        </Alert>
      );
    }
    return null;
  }
}

class GuessedWord extends React.Component {
  render() {
    if (this.props.gameStarted) {
      return (
        <>
          <div style={{ display: "inline" }}>
            <ReactFitText compressor={2}>
              <h1>{this.props.guessedWord}</h1>
            </ReactFitText>
          </div>
        </>
      );
    }
    return null;
  }
}

const mainLines = [
  "Bakerloo",
  "Central",
  "Circle",
  "District",
  "Hammersmith & City",
  "Jubilee",
  "Metropolitan",
  "Northern",
  "Piccadilly",
  "Victoria",
  "Waterloo & City",
];

const data = tubeData.slice();
export default App;
