import React from "react";
import tubeData from "./data.js";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "./logo.jpg";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
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
      word: randomTube(),
      currentGuess: "",
      wrongGuesses: [],
      guessedWord: [],
      isComplete: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    let arrayOfBlanks = [];
    this.state.word.Station.split("").forEach((x) => {
      if (x === "-") {
        arrayOfBlanks.push("- ");
      } else if (x !== " ") {
        arrayOfBlanks.push("__ ");
      } else {
        arrayOfBlanks.push(" / ");
      }
    });
    this.setState({
      guessedWord: arrayOfBlanks,
    });
  }

  handleChange(event) {
    this.setState({
      currentGuess: event.target.value,
    });
  }

  handleSubmit(event) {
    let stationArray = this.state.word.Station.toLowerCase().split("");
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
      guessedWord: word.Station.split(""),
      wrongGuesses: [],
      isComplete: true,
    });
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
              <font size="20">{this.state.guessedWord}</font>
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
              <center>
                <Guesses
                  handleSubmit={this.handleSubmit}
                  handleChange={this.handleChange}
                  currentGuess={this.state.currentGuess}
                  wrongGuesses={this.state.wrongGuesses}
                  isComplete={this.state.isComplete}
                  word={this.state.word}
                />
                <div class="py-3">
                  <SummaryInfo
                    isComplete={this.state.isComplete}
                    station={this.state.word}
                  />
                </div>
              </center>
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
                  placeholder="Next guess"
                  value={this.props.currentGuess}
                  onChange={this.props.handleChange}
                ></Form.Control>
              </Form.Group>
              <Button varient="primary" type="Submit">
                Submit
              </Button>
            </Form>
          </div>
          <div>
            <font size="5">Wrong guesses: {this.props.wrongGuesses}</font>
          </div>
        </>
      );
    } else {
      return null;
    }
  }
}

class SummaryInfo extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     lines: "",
  //     zones: ""
  //   };
  // }

  // componentDidMount() {
  //   this.setState({
  //     lines: this.getLines(),
  //     zones: this.getZones()
  //   });
  // }

  // getLines() {
  //   var lines = "";
  //   const servingLines = this.props.station.servingLines.slice();
  //   for (let i = 0; i < servingLines.length; i++) {
  //     if (typeof servingLines[0].servingLine !== "undefined") {
  //       lines = lines + servingLines[i].servingLine;
  //     } else {
  //       lines = lines + servingLines[i];
  //     }
  //   }
  //   return lines ? lines : "N/A";
  // }

  // getZones() {
  //   var lines = "";
  //   for (let i = 0; i < this.props.station.zones.length; i++) {
  //     if (typeof this.props.station.zones[0].zone !== "undefined") {
  //       lines = lines + this.props.station.zones[i].zone + ", ";
  //     } else {
  //       lines = lines + this.props.station.zones[0];
  //     }
  //   }
  //   return lines ? lines : "N/A";
  // }

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
              this.props.station.Postcode +
              "&key=AIzaSyA6cw7TKh0Da4IPxxfWzAXcNLOPGsftWMg"
            }
            allowfullscreen
          ></iframe>
          <div>
            <font size="5">
              The station chosen for this round was:{" "}
              {this.props.station.Station}
            </font>
          </div>
        </>
      );
    }
    return null;
  }
}

function capitaliseString(string) {
  string.map((x) => x.charAt(0).toUpperCase() + x.substring(1)).join("/");
}

function randomTube() {
  const numberOfStations = data.length;
  return data[Math.floor(Math.random() * numberOfStations)];
}

const data = tubeData.slice();
export default App;
