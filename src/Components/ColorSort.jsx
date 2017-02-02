import React from 'react';
import { NavItem } from 'rebass';

const ColorSort = (props) => {
  const colors = props.colors;
  const colorpick = props.colorpick;
  const area = props.area;
  const manaFont = ['ms-w', 'ms-u', 'ms-b', 'ms-r', 'ms-g', 'ms-c', 'ms-split ms-ur'];
  const styles = {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'stretch'
  };


  return (
    <div className="ColorSort" style={styles}>
      {
        colors.map((color, index) => {
          const show = colors[index] ? 'ms-cost' : '';
          return (
            <NavItem key={index} onClick={() => colorpick(index, area)} >
              <i className={`ms ms-2x ${manaFont[index]} ${show}`} />
            </NavItem>
          );
        })
      }
    </div>
  );
};

ColorSort.propTypes = {
  colors: React.PropTypes.arrayOf(React.PropTypes.number),
  colorpick: React.PropTypes.func,
  area: React.PropTypes.string
};

export default ColorSort;
