import React, { Component } from 'react';
import './css/App.css';
import './css/mana.css';

import { Toolbar, NavItem, Space, Container, 
        Footer, Section, SectionHeader,
        Heading, Text, Circle } from 'rebass';
import { Grid, Flex } from 'reflexbox';
import { filterColor, showCard } from './Assets/helpers';
import MtgCard from './Components/MtgCard';

import { DraftAER, SortColor, SortRating } from './Assets/draft';


class App extends Component {
  // colors: WUBRG, artifacts
  state = {
    collection: {},
    pool: [],
    deck: [],
    unplayable: [],
    poolcolors: [1,1,1,1,1,1],
    deckcolors: [1,1,1,1,1,1]
  }

  componentWillMount() {

    // check if there is any order in localStorage
    const localStorageRef = localStorage.getItem(`simmer`);
    let collection;
    collection = DraftAER();

    let pool;
    pool = [...collection];

    this.setState({
      collection: collection,
      pool: pool
    })
  }


  addToDeck = (card) => {
    // Add card to the deck stack.
    let deck = [...this.state.deck];
    let pool = [...this.state.pool];
    deck.push(card);
    pool.splice(pool.indexOf(card), 1)
    this.setState({
      deck:deck,
      pool:pool
    })
  }

  removeFromDeck = (card) => {
    // Add card to the deck stack.
    let deck = [...this.state.deck];
    let pool = [...this.state.pool];
    pool.push(card);
    deck.splice(deck.indexOf(card), 1)
    this.setState({
      deck:deck,
      pool:pool
    })
  }

  changeColorFilter = (color, area) => {
    const color_names = ["white", "blue", "black", "red", "green", "artifacts"];
    const color_id = color_names.indexOf(color);
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
            <NavItem>New Pool</NavItem>
            <NavItem>About</NavItem>
          </Toolbar>
        </div>
        <div>
          <Grid col={9}>
            <Container style={{ maxWidth: 1160}}>
              <Section>
                <SectionHeader
                  description="Cards in pool"
                  heading="Pool Area"
                />
                <Toolbar
                  backgroundColor="white"
                  color="black"
                >
                <i className="ms ms-w ms-cost ms-3x" onClick={() => this.changeColorFilter("white", "poolcolors")}></i>
                <i className="ms ms-u ms-cost ms-3x" onClick={() => this.changeColorFilter("blue", "poolcolors")}></i>
                <i className="ms ms-b ms-cost ms-3x" onClick={() => this.changeColorFilter("black", "poolcolors")}></i>
                <i className="ms ms-r ms-cost ms-3x" onClick={() => this.changeColorFilter("red", "poolcolors")}></i>
                <i className="ms ms-g ms-cost ms-3x" onClick={() => this.changeColorFilter("green", "poolcolors")}></i>
                <i className="ms ms-a ms-cost ms-3x" onClick={() => this.changeColorFilter("artifacts", "poolcolors")}></i>
                </Toolbar>
                <Flex wrap justify="center" className="card-area--pool">
                  { 
                    SortColor(this.state.collection)
                    .map((card, index) => {
                      const show = showCard(this.state.pool, this.state.poolcolors, card)
                      return <MtgCard key={index} showCard={show} card={card} clickFunction={this.addToDeck}/>}
                      )
                  }
                </Flex>
              </Section>
            </Container>
          </Grid>
          <Grid col={3}>
            <Container>
              <Section>
                <SectionHeader
                  description="Cards in deck"
                  heading="Deck Area"
                />
                <Flex wrap justify="center" className="card-area--deck">
                   { 
                    SortColor(this.state.collection)
                    .map((card, index) => {
                      const show = showCard(this.state.deck, this.state.deckcolors, card)
                      return <MtgCard key={index} showCard={show} card={card} clickFunction={this.removeFromDeck}/>}
                      )
                  
                }
                </Flex>
              </Section>
            </Container>
          </Grid>
        </div>
        <Footer>
        Wizards of the Coast, Magic: The Gathering, and their logos are trademarks of Wizards of the Coast LLC. © 2017 Wizards. All rights reserved. 
        Simmer is not affiliated with Wizards of the Coast LLC. The copyright for Magic: the Gathering and all associated card names and card images is held by Wizards of the Coast.
        </Footer>
      </div>
    );
  }
}

export default App;
