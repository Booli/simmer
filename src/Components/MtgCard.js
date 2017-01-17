import React, { Component } from 'react';
import { Card, CardImage } from 'rebass';

class MtgCard extends Component {
  render() {
    return (
      <div onClick={() => this.props.clickFunction(this.props.card)}>
        <Card width={223}>
          <CardImage src={ process.env.PUBLIC_URL + this.props.card.image}/>
        </Card>
      </div>
    )
  }
}

export default MtgCard;
