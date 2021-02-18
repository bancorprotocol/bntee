import {Button} from 'react-bootstrap';

export default function AddressButton(props) {
  const {address, onClick} = props;
  return (
    <Button onClick={onClick} className="address-btn">
      {address.substring(0, 5)}...{address.substring(address.length - 4, address.length - 1)}
      <div className="green-circle"/>
    </Button>
    )
} 