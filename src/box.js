import boxen from 'boxen';

export default input => boxen(input, {
  padding: 1, margin: 1, float: 'center', align: 'center', borderStyle: 'double',
});
