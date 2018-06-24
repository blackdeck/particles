import React, { Component } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import Footer from './footer.js'

import './css/App.css';

import {game_name} from './game/app_config';
import {getDefaultState} from './game/default_state';
import {frame} from './game/frame';
import {tick} from './game/tick';
import {data} from './game/data';
import {oneclickers} from './game/oneclickers';
import {clickers} from './game/clickers';
import {automators} from './game/automators';
import {stars} from './game/stars';

import {modes} from './game/modes';
import {modules} from './game/modules';
import {upgrades} from './game/upgrades';
import Popup from "./utils/Popup/Popup";

import {Circle} from 'react-shapes';



class App extends Component {
    constructor(props) {
        super(props);

        this.timerID = null;

        this.playGame = this.playGame.bind(this);
        this.pauseGame = this.pauseGame.bind(this);
        this.setGameSpeed = this.setGameSpeed.bind(this);
        this.tick = this.tick.bind(this);
        this.newGame = this.newGame.bind(this);
        this.createPopup = this.createPopup.bind(this);

        this.state = getDefaultState();

    }


    componentDidMount() {
        console.log('App '+game_name+' componentDidMount');
        var app_state = JSON.parse(localStorage.getItem(game_name+"_app_state"));
        this.setState(app_state ? app_state : getDefaultState());
        this.playGame();
    }

    playGame() {
        clearInterval(this.timerID);
        this.timerID = setInterval(
            () => this.frame(),
            Math.floor(this.state.game_speed / this.state.frame_rate / this.state.game_speed_multiplier)
        );
        this.setState({game_paused: false});
    }

    pauseGame() {
        clearInterval(this.timerID);
        this.setState({game_paused: true});
    }

    setGameSpeed(speed) {
        this.setState({game_speed_multiplier: speed});
        this.playGame();
    }

    newGame() {
        if (!window.confirm('Are you ready to start a new game? Your progress will be lost.')) return false;
        localStorage.setItem(game_name+"_app_state", null);
        this.setState(getDefaultState());
        this.playGame();
    }

    frame() {
        let state = frame(this.state);
        state.frame++;

        let frame_rate = state.mode === "slow" ? state.frame_rate * 2
                       : state.mode === "fast" ? Math.round(state.frame_rate / 2)
                       : state.frame_rate;

        if (state.frame % frame_rate === 0) {
            state = this.tick(state);
            state.tick++;
        }
        this.setState(state);
    }

    tick(initial_state) {
        let state = tick(initial_state);
        localStorage.setItem(game_name+"_app_state", JSON.stringify(state));
        return state; // this.setState(state);
    }


    onClickWrapper(item) {
        if (item.cost) {
            if (this.isEnough(this.state, item.cost)) {
                if (item.onClick) this.setState(item.onClick(this.chargeCost(this.state, item.cost)));
            }
            else { return false; }
        }
        else {
            if (item.onClick) this.setState(item.onClick(this.state));
        }
    }

    drawCost(cost) {
        let text = '';
        _.each(cost, (value, resource) => {
            if (value > 0) {
                text += resource + ': ' + value + ' ';
            }
        });
        return text;
    };

    isEnough(state, cost) {
        let enough = true;
        _.each(cost, (value, resource_key) => {
            if (state[resource_key] < value) enough = false;
        });
        return enough;
    }

    chargeCost(state, cost) {
        if (!this.isEnough(this.state, cost)) return false;
        _.each(cost, (value, resource_key) => {
            state[resource_key] -= value;
        });
        return state;
    }

    createPopup() {
        //TODO REMOVE Used only for demonstrational purposes
        if (!this.i) {
            this.i = 0;
        }
        this.i = ++this.i;
        this.popupHandler.createPopup(`POPUP №${this.i}`, <div>{'This is... You guessed it. A POPUP!!!'}</div>);
    }

    render() {
        let state = this.state;


        const tooltip = (state, item) =>
            <Tooltip id="tooltip">
                <div className="col-lg-12 infoBar">
                    <span>{item.name}</span>
                    <br />
                    <span style={{fontSize: '10px'}}> {item.text ? item.text : ''}</span>
                </div>

                 {_.map(item.cost, (value, resource_key) =>
                     (!item.cost)
                         ? ''
                         :
                                <div className="row" key={resource_key}>
                                <div className="col-sm-6 infoBar">{resource_key}</div>
                                <div className="col-sm-6 infoBar">{value} / {state[resource_key]} </div>
                            </div>
                        )}

            </Tooltip>;



        return (
            <div className="App">
                { /* <Popup ref={(p) => this.popupHandler = p} /> -->
                <button onClick={() => this.createPopup()}>MakeNewPopup</button> */}
               <div className="header" style={{backgroundImage: "url(solar.png)"}}>
                <h2>Particles Inkremental</h2>

                <div style={{color: '#982727'}}>
                    Temperature: {state.temperature.toFixed(1)}
                </div>
               </div>


                <div className="flex-container-row resources">
                        <div className="flex-element">
                            <h6>Basic particles</h6>
                           <img src = {"./img/basic_particles.png"} />
                            { _.map(data.basic_particles, (item, key) =>
                                <div key={key}>
                                    {item.name}: {state[key]}
                                </div>
                            )}
                        </div>

                        <div className="flex-element">
                            <h6>Atoms</h6>
                            <img src = {"./img/atoms.png"} />
                            { _.map(data.atoms, (item, key) =>
                                <div key={key}>
                                    {item.name}: {state[key].toFixed(2)}
                                </div>
                            )}
                        </div>

                        <div className="flex-element">
                            <h6>Simple molecules</h6>
                            <img src = {"./img/simple_molecules.png"} />
                            { _.map(data.simple_molecules, (item, key) =>
                                <div key={key}>
                                    {item.name}: {state[key].toFixed(2)}
                                </div>
                            )}
                        </div>

                    <div className="flex-element">
                        <h6>Stars</h6>
                        <img src = {"./img/star.png"} />
                        { _.map(data.stars, (item, key) =>
                            <div key={key}>
                                {item.name}: {state[key].toFixed(2)}
                            </div>
                        )}
                    </div>

                    <div className="flex-element">
                        <h6>Your stars</h6>
                        <div  style={{ height: '150px', overflowY: 'scroll'}}>
                        {_.map(state.stars, (item, key) =>
                            <div key={key} style={{border: '1px solid #BDBDBD'}} className="flex-container-row">
                                    <div className="flex-element" style={{textAlign: 'center'}}>

                                <Circle r={1 + item.star.diameter} fill={{color: '#6C256F'}}
                                        stroke={{color: '#4E4E9A'}} strokeWidth={item.star.density}/>
                                </div>

                                    <div className="flex-element">
                                    {item.star.name}
                                    <br/>
                                Density: {item.star.density}
                                    <br/>
                                Diameter: {item.star.diameter}
                                    </div>
                            </div>
                        )}
                        </div>
                    </div>

                </div>

                <div className="flex-container-row">

                    <div className="flex-element">
                    <div className="flex-container-row">
                        <div className="flex-element">
                        <h3>Clickers</h3>
                        </div>
                    </div>

                    <div className="flex-container-row">

                    <div className="flex-element">
                         {_.map(clickers.basic_particles, (item, key) =>
                                    (item.locked && item.locked(this.state))
                                        ? ''
                                        :
                                        <div key={key}>
                                            <OverlayTrigger delay={150} placement="right"
                                                            overlay={tooltip(this.state, item)}>
                                                <button
                                                    className={(item.cost ? this.isEnough(this.state, item.cost) ? '' : 'disabled' : '')}
                                                    onClick={() => {
                                                        this.onClickWrapper(item);
                                                    }}>
                                                    {item.name}
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                )}
                            </div>

                        <div className="flex-element">
                            {_.map(clickers.leptons, (item, key) =>
                                (item.locked && item.locked(this.state))
                                    ? ''
                                    :
                                    <div key={key}>
                                        <OverlayTrigger delay={150} placement="right"
                                                        overlay={tooltip(this.state, item)}>
                                            <button
                                                className={(item.cost ? this.isEnough(this.state, item.cost) ? '' : 'disabled' : '')}
                                                onClick={() => {
                                                    this.onClickWrapper(item);
                                                }}>
                                                {item.name}
                                            </button>
                                        </OverlayTrigger>
                                    </div>
                            )}
                        </div>

                        <div className="flex-element">
                            {_.map(clickers.atoms, (item, key) =>
                                (item.locked && item.locked(this.state))
                                    ? ''
                                    :
                                    <div key={key}>
                                        <OverlayTrigger delay={150} placement="right"
                                                        overlay={tooltip(this.state, item)}>
                                            <button
                                                className={(item.cost ? this.isEnough(this.state, item.cost) ? '' : 'disabled' : '')}
                                                onClick={() => {
                                                    this.onClickWrapper(item);
                                                }}>
                                                {item.name}
                                            </button>
                                        </OverlayTrigger>
                                    </div>
                            )}
                        </div>
                    </div>
                    </div>


                    <div className="flex-element">
                        <h3>Automation</h3>
                        {_.map(automators, (item, key) =>
                            (item.locked && item.locked(this.state))
                                ? ''
                                :
                                <div key={key} className="flex-container-row automation">
                                       <div className="flex-element">
                                           <div className="col-sm-6" style={{textAlign: "right"}}>{item.name}: {state[key]}</div>

                                        <OverlayTrigger delay={150} placement="right" overlay={tooltip(this.state, item)}>
                                        <span>
                                           <div className="col-sm-6">
                                            {<button
                                                className={(item.cost ? this.isEnough(this.state, item.cost) ? '' : 'disabled' : '')}
                                                onClick={() => { this.onClickWrapper(item); }}>
                                                +
                                            </button>}


                                            {<button
                                                className={( state[key]>0 ? '' : 'disabled')}
                                                onClick={() => { state[key]>0 ? state[key]-=1 : false}}>
                                                -
                                            </button>}
                                            </div>

                                           </span>
                                           </OverlayTrigger>

                                            </div>
                                </div>
                        )}
                    </div>

                    <div className="flex-element">
                        <h3>Upgrades</h3>
                        {_.map(oneclickers, (item, key) =>
                            (item.locked && item.locked(this.state))
                                ? ''
                                :
                                <div key={key}>
                                    <OverlayTrigger delay={150} placement="left" overlay={tooltip(this.state, item)}>
                                        {this.state[key]
                                            ? <span className="badge">{item.name}</span>
                                            :
                                            <button
                                                className={(item.cost ? this.isEnough(this.state, item.cost) ? '' : 'disabled' : '')}
                                                onClick={() => { this.onClickWrapper(item); }}>
                                                {item.name}
                                            </button>}
                                    </OverlayTrigger>
                                </div>
                        )}
                    </div>

                </div>



                <div className="flex-element flex-container-row">
                    <div className="flex-element">
                        <h4>Tick: {this.state.tick} Frame: {this.state.frame} </h4>
                        <h4>Mode: {modes[this.state.mode].name}</h4>
                    </div>

                    {_.map(modes, (item, key) =>
                        (item.locked && item.locked(this.state))
                            ? ''
                            :
                            <div className="flex-element" key={key}>
                                <OverlayTrigger delay={150} placement="right" overlay={tooltip(this.state, item)}>
                                    {<button
                                        className={classNames(
                                            this.state.mode === key ? 'btn-success' : 'btn-warning',
                                            item.cost ? this.isEnough(this.state, item.cost) ? '' : 'disabled' : ''
                                        )}
                                        onClick={() => { this.onClickWrapper(item); }}>
                                        {item.name}
                                    </button>}
                                </OverlayTrigger>
                            </div>
                    )}
                </div>


            <Footer newGame={this.newGame}/>
            </div>
        );
    }
}

export default App;
