import React from 'react';
import { Card, CardImage } from 'rebass';

const MtgCard = (props) => {
  const show = props.showCard ? '': 'hidden';
  return (
    <div className={`${show} MtgCard`} onClick={() => props.clickFunction(props.card)}>
      <Card width={223}>
        <CardImage src={ process.env.PUBLIC_URL + props.card.image}/>
      </Card>
    </div>
  )
}

export default MtgCard;
