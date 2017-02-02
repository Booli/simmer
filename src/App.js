import React, { Component } from 'react';
import './css/App.css';
import './css/mana.css';

import { Toolbar, NavItem, Space, Container, 
        Footer, Heading } from 'rebass';
import { Grid, Flex } from 'reflexbox';
import { showCard } from './Assets/helpers';
import MtgCard from './Components/MtgCard';
import ColorSort from './Components/ColorSort';

import { DraftAER, SortColor } from './Assets/draft';


class App extends Component {
  // colors: WUBRG, artifacts
  state = {
    collection: {},
    pool: [],
    deck: [],
    unplayable: [],
    poolcolors: [1,1,1,1,1,1,1],
    deckcolors: [1,1,1,1,1,1,1]
  }

  componentWillMount() {

    // check if there is any order in localStorage
    const localStorageRef = localStorage.getItem(`simmer`);
    if (localStorageRef) {
      const state = JSON.parse(localStorageRef)
      this.setState({
        ...state
      })
    } else {
      let collection;
      collection = SortColor(DraftAER());

      let pool;
      pool = collection.map(card => card.collection_index);

      this.setState({
        collection: collection,
        pool: pool
      })
     }
  }
  
  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem(`simmer`, JSON.stringify(nextState));
  }

  createNewPool() { 
    let collection = SortColor(DraftAER());

    let pool = collection.map(card => card.collection_index);
    let cleared_state = {
      deck: [],
      unplayable: [],
      poolcolors: [1,1,1,1,1,1,1],
      deckcolors: [1,1,1,1,1,1,1]
    }
    this.setState({
      ...cleared_state,
      pool,
      collection
    })
  }

  moveToStack = (fromStack, toStack, card) => {
    // Add card to the deck stack.
    let stackTo = [...this.state[toStack]];
    let stackFrom = [...this.state[fromStack]];
    stackTo.push(card.collection_index);
    stackFrom.splice(stackFrom.indexOf(card.collection_index), 1)
    this.setState({
      [toStack]: stackTo,
      [fromStack]: stackFrom
    })
  }

  changeColorFilter = (color_id, area) => {
    let colors = this.state[area];
    colors[color_id] = ~~!colors[color_id];
    this.setState({
      [area]: colors
    })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Toolbar>
            <NavItem>Simmer</NavItem>
            <Space auto/>
            <NavItem onClick={()=> this.createNewPool()}>New Pool</NavItem>
            <NavItem>About</NavItem>
          </Toolbar>
        </div>
        <div>
          <Grid col={9}>
            <Container style={{ maxWidth: 1160}}>
                <Toolbar
                  backgroundColor="white"
                  color="black"
                >
                  <NavItem>
                    <Heading>
                      Pool
                    </Heading>
                  </NavItem>
                  <Space auto/>
                  <ColorSort colors={this.state.poolcolors} colorpick={this.changeColorFilter} area="poolcolors" />
                  <Space auto/>
                </Toolbar>
                <Flex wrap justify="center" className="card-area--pool">
                {
                  [...Array(7).keys()]
                  .map(key => { 
                    const show = this.state.poolcolors[key] ? '': 'hidden';
                    return <Grid wrap key={key} className={`card-area ${show}` }>
                      { 
                        this.state.collection
                        .filter(card => parseInt(card.colorsort,10) === key)
                        .map((card, index) => {
                          const show = showCard(this.state.pool, card)
                          return <MtgCard key={index} showCard={show} card={card} clickFunction={this.moveToStack} fromStack={"pool"} toStack={"deck"} />}
                          )
                      }
                    </Grid>
                  })
                }
                </Flex>
            </Container>
          </Grid>
          <Grid col={3}>
            <Container>
              <Toolbar
                backgroundColor="white"
                color="black"
              >
                <NavItem>
                  <Heading>
                    Deck
                  </Heading>
                </NavItem>
              </Toolbar>
              <Flex wrap justify="center" className="card-area card-area--deck">
              {
                [...Array(7).keys()]
                .map(key => { 
                  return <Grid key={key} className={this.state.deckcolors[key] ? '': 'hidden'}>
                    { 
                      this.state.collection
                      .filter(card => parseInt(card.colorsort,10) === key)
                      .map((card, index) => {
                        const show = showCard(this.state.deck, card)
                        return <MtgCard key={index} showCard={show} card={card} clickFunction={this.moveToStack} fromStack="deck" toStack="pool"/>}
                        )
                    }
                  </Grid>
                })
              }

              </Flex>
            </Container>
          </Grid>
        </div>
        <Footer>
          <Container>
            Wizards of the Coast, Magic: The Gathering, and their logos are trademarks of Wizards of the Coast LLC. © 2017 Wizards. All rights reserved. 
            Simmer is not affiliated with Wizards of the Coast LLC. The copyright for Magic: the Gathering and all associated card names and card images is held by Wizards of the Coast.
          </Container>
        </Footer>
      </div>
    );
  }
}

export default App;
