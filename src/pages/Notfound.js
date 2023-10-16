import React,{useEffect} from "react";
import '../assets/style/Notfound.css';
import NotFoundImage from '../assets/image/error.png';

const Notfound = () => {
    return (
        <>
            <div className="not-found-container">
                <img src={NotFoundImage} alt="Not Found" className="not-found-image" />
                <p className="not-found-text">
                    La page que vous recherchez est introuvable ou n'existe plus.
                </p>
            </div>
        </>
    )
}
export default Notfound;