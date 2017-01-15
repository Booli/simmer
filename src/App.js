import React, { Component } from 'react';
import './App.css';

import { Toolbar, NavItem, Space, Container, 
        Footer, Section, SectionHeader,
        Card, CardImage, Heading, Text, Circle } from 'rebass';
import { Grid, Flex } from 'reflexbox';
import { filterColor } from './Assets/helpers';

import { DraftAER, SortColor, SortRating } from './Assets/draft';

class MtgCard extends Component {
  render() {
    return (
      <div onClick={() => this.props.clickFunction(this.props.card, this.props.index)}>
        <Card width={223}>
          <CardImage src={ process.env.PUBLIC_URL + this.props.card.image}/>
        </Card>
      </div>
    )
  }
}

class App extends Component {
  state = {
    collection: {},
    pool: [],
    deck: [],
    unplayable: [],
    poolcolors: [1,1,0,0,0],
    deckcolors: [1,1,0,0,0]
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


    addToDeck = (card, index) => {
      // Add card to the deck stack.
      let deck = [...this.state.deck];
      let pool = [...this.state.pool];
      deck.push(card);
      pool.splice(index, 1)
      this.setState({
        deck:deck,
        pool:pool
      })
    }

    removeFromDeck = (card, index) => {
    // Add card to the deck stack.
    let deck = [...this.state.deck];
    let pool = [...this.state.pool];
    pool.push(card);
    deck.splice(index, 1)
    this.setState({
      deck:deck,
      pool:pool
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
                <Circle 
                  backgroundColor="Blue"
                  color="white"
                >
                U
                </Circle>
                </Toolbar>
                <Flex wrap justify="center" className="card-area--pool">
                  { 
                    SortColor(this.state.pool)
                    .filter((card) => { 
                      return filterColor(this.state.poolcolors, card.colors)
                    })
                    .map((card, index) => <MtgCard key={index} index={index} card={card} clickFunction={this.addToDeck}/>)
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
                    SortColor(this.state.deck)
                    .filter((card) => { 
                      return filterColor(this.state.deckcolors, card.colors)
                    })
                    .map((card, index) => <MtgCard key={index} index={index} card={card} clickFunction={this.removeFromDeck}/> )
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
