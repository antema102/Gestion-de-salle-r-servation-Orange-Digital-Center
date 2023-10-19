import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody,Button,ModalFooter} from 'reactstrap';
import '../assets/style/test.css'
function Popup() {
  const [modal, setModal] = useState(true)
  const toggle = () => setModal(!modal);

  
  const closeModal = () => {
    toggle(); // Appeler la fonction toggle pour fermer la modal
  };

  return (
    <div>
       <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader >Alert</ModalHeader>
        <ModalBody>
           Salle supprimée avec succès
        </ModalBody>
        <ModalFooter>
        <Button onClick={closeModal}>Fermer</Button> {/* Appeler la fonction closeModal sur le clic */}
      </ModalFooter>
      </Modal>
    </div>
  );
}

export default Popup;