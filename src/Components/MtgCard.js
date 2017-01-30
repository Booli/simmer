import React, { Component, PureComponent } from 'react';
import { Card, CardImage } from 'rebass';

class MtgCard extends Component {
  render() {
    return (
      <div className={this.props.showCard ? '': 'hidden'} onClick={() => this.props.clickFunction(this.props.card)}>
        <Card width={223}>
          <CardImage src={ process.env.PUBLIC_URL + this.props.card.image}/>
        </Card>
      </div>
    )
  }
}

export default MtgCard;
