import React, { Component } from 'react';
import './App.css';

import { Toolbar, NavItem, Space, Container, 
        Footer, Section, SectionHeader,
        Card, CardImage, Heading, Text } from 'rebass';
import { Grid, Flex } from 'reflexbox';

import { Draft_AER } from './Assets/draft.js';

class MtgCard extends Component {
  render() {
  console.log(this.props.info.image)
    return (
      <Card width={223}>
        <CardImage src={ process.env.PUBLIC_URL + this.props.info.image}/>
        <Heading>
        </Heading>
        <Text>
        {this.props.info.cmc}
        </Text>
      </Card>
    )
  }
}

class App extends Component {
  
  state = {
    collection: {}
  }

  componentWillMount() {
    let collection = Draft_AER();
    this.setState({collection: collection})
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Toolbar>
            <NavItem>Simmer</NavItem>
            <Space auto/>
            <NavItem>Draft</NavItem>
            <NavItem>Seal</NavItem>
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
                <Flex wrap justify="center">
                  { 
                    this.state.collection.map((card, index) => <MtgCard key={index} index={index} info={card}/> )
                  }
                </Flex>
              </Section>
            </Container>
          </Grid>
          <Grid col={3}>
              Deck Area
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
