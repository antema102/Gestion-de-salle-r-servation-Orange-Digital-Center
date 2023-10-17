import '../assets/style/Connection.css';
import logo_orange from '../assets/image/logo.jpg'
import { RiLockPasswordLine } from 'react-icons/ri'
import { AiOutlineUserAdd } from 'react-icons/ai'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { AlertCn, AlertCnS, AlertCnss } from './Alert.js'
const Connection = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [AlertConnexion, setAlertConnexion] = useState(false)
    const [AlertConnexionSucces, SetAlertConnexionSucces] = useState(false)
    const [AlertConnexions, setAlertConnexions] = useState(false);
    const navigate = useNavigate();
    let time;
    let times;

    const handleOnSubmit = async (e) => {
        try {
            const connexion = {
                username: username,
                password: password
            }
            e.preventDefault();
            let result = await fetch('http://127.0.0.1:3001/connexion',
                {
                    method: 'POST',
                    body: JSON.stringify(connexion),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            if (result.ok) {
                const data = await result.json();
                const token = data.token;

                // Stockez le jeton JWT dans le stockage local
                localStorage.setItem('token', token);

                // Effacez le nom d'utilisateur et le mot de passe du formulaire
                setUsername('');
                setPassword('');
                SetAlertConnexionSucces(true)
                navigate('/acceuil');
            } else {
                setAlertConnexions(false)
                setAlertConnexion(true)
            }
        } catch (error) {
            console.log('error')
        }
    };

    const isTokenExpired = (token) => {
        try {
            if (!token) {
                return true; // Gérer le cas où le token est null
            }
            const tokenParts = token.split('.');
            const parsedToken = JSON.parse(atob(tokenParts[1]));
            const tokenExpiration = parsedToken.exp * 1000; // Convertir en millisecondes
            return Date.now() >= tokenExpiration;
        } catch (error) {
            console.error(error);
            return true; // Gérer les erreurs de décodage du token comme une expiration
        }
    };


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (isTokenExpired(token)) {
            setAlertConnexions(true)
        }
    }, []);


    useEffect(() => {

        if (AlertConnexions) {
            times = setTimeout(() => {
                setAlertConnexions(false)
            }, 5000)
        }

        if (AlertConnexion) {
            time = setTimeout(() => {
                setAlertConnexion(false)
            }, 10000)
        }

        return () => {
            clearTimeout(time)
            clearTimeout(times)
        }

    }, [AlertConnexion, AlertConnexions])

    return (
        <div className='background-gray'> {/* Ajoutez la classe background-gray ici */}
            <div className='test'>
                <div className='container_test'>
                    <div className="row">
                        <div className="col-md-4">
                            <img src={logo_orange} alt='logo orange' width='100px' /></div>
                        <div className="col-md-8">
                            <p>Application web gestion de salle et Reservation</p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-12 ligne'>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className="form-group">
                                <label htmlFor="user">Utilisateur</label>
                                <div className="input-group">
                                    <div className="input-group-append">
                                        <span className="input-group-text">
                                            <AiOutlineUserAdd />
                                        </span>
                                    </div>
                                    <input type="text" className="form-control input"
                                        id="user"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder='Utilisateur'
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="mdp">Mot de passe</label>
                                <div className="input-group">
                                    <div className="input-group-append">
                                        <span className="input-group-text">
                                            <RiLockPasswordLine />
                                        </span>
                                    </div>
                                    <input type="password" className="form-control input"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder='Mot de passe'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-12'>


                            {
                                AlertConnexionSucces && (
                                    < AlertCnS />
                                )
                            }


                            {
                                AlertConnexion && (
                                    <AlertCn />
                                )
                            }

                            {
                                AlertConnexions && (
                                    < AlertCnss />
                                )
                            }

                            <button type="button"
                                className="btn custom-btn connection btn-block"
                                onClick={handleOnSubmit}
                            >Connection</button>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-12 ligne'>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Connection;