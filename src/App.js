import React, { Component } from 'react';
import { AppConfig } from 'blockstack'
import { UserSession } from 'blockstack'
import { lookupProfile } from 'blockstack'
import './App.css';
import UserInfo from './UserInfo';
const blockstack = require('blockstack');
import "semantic-ui-css/semantic.min.css";
import { spring, AnimatedSwitch } from "react-router-transition";
import { Route, withRouter } from "react-router-dom";
import Home from "./components/Home";
import NavBar from "./components/NavBar";
import Welcome from "./components/Welcome";
import { Gradient } from "react-gradient";
import { gradients } from "./gradients";

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      person: undefined,
      userSession: new UserSession({ appConfig: new AppConfig(['store_write', 'publish_data'])})
    }

    this.handleSignIn = this.handleSignIn.bind(this)
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  componentDidMount = async () => {
    let isSignedIn = await this.checkSignedInStatus();
    if (isSignedIn) {
      this.loadPerson();
    }

    this.setState({ isSignedIn })
  }

  checkSignedInStatus = async () => {
    const { userSession } = this.state

    if (userSession.isUserSignedIn()) {
      return true;
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(async(userData) => {
        window.location = window.location.origin
      })
      return false;
    }
  }

  loadPerson = async () => {
    const { userSession } = this.state
    let username = userSession.loadUserData()

    await lookupProfile(username).then((person) => {
      this.setState({ person })
    })
  }

  handleSignIn(event) {
    event.preventDefault();
    blockstack.redirectToSignIn()
  }

  handleSignOut(event) {
    event.preventDefault();
    blockstack.signUserOut(window.location.href)
  }

  // we need to map the `scale` prop we define below
  // to the transform style property
  mapStyles = styles => {
    return {
      opacity: styles.opacity,
      transform: `scale(${styles.scale})`
    };
  };

  // wrap the `spring` helper to use a bouncy config
  bounce = val => {
    return spring(val, {
      stiffness: 330,
      damping: 22
    });
  };

  render() {
    // child matches will...
    const bounceTransition = {
      // start in a transparent, upscaled state
      atEnter: {
        opacity: 0,
        scale: 1.2
      },
      // leave in a transparent, downscaled state
      atLeave: {
        opacity: this.bounce(0),
        scale: this.bounce(0.8)
      },
      // and rest at an opaque, normally-scaled state
      atActive: {
        opacity: this.bounce(1),
        scale: this.bounce(1)
      }
    };
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Blockstack Create React App</h1>
        </header>
        <p style={{display: this.state.isSignedIn ? 'none' : 'block' }}>
          <button onClick={this.handleSignIn}>
            Sign-in with Blockstack
          </button>
        </p>
        <p style={{display: !this.state.isSignedIn ? 'none' : 'block' }}>
          <UserInfo user={this.state.person} />
          <button onClick={this.handleSignOut}>
            Sign-out
          </button>
        </p>
        <Gradient
        gradients={gradients.disgust} // required
        property="background"
        duration={3000}
        angle="45deg"
      >
        <div id="gradient">
          <NavBar />
          <AnimatedSwitch
            atEnter={bounceTransition.atEnter}
            atLeave={bounceTransition.atLeave}
            atActive={bounceTransition.atActive}
            mapStyles={this.mapStyles}
            className="route-wrapper"
          >
            <Route exact path="/home" component={Home} />
            <Route exact path="/welcome" component={Welcome} />
          </AnimatedSwitch>
        </div>
      </Gradient>
      </div>
    )
  }
}

export default App;
