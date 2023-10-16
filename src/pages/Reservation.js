import React, { useState, useEffect } from "react";
import '../assets/style/Reservation.css';
import { AlertError, AlertSuccess } from "./Alert";
import Pagination from "./Pagination";
import ClipLoader from "react-spinners/ClipLoader";

const Reservation = () => {
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;


    const onNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const onPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const onPageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const [date_rdv, setDate_rdv] = useState("")
    const [heur_debut, setHeur_debut] = useState('')
    const [heur_fin, setHeur_fin] = useState('')
    const [trigram, setTrigram] = useState("")
    const [description, setDescription] = useState("")
    const [reservation, setReservation] = useState([])
    const [salleID, setSalleID] = useState("")
    const [alert_succes, setAlert_succes] = useState(false);
    const [salle, setSalle] = useState([])
    const [alert_error, setAlert_error] = useState(false);
    const totalPages = Math.ceil(salle.length / recordsPerPage);
    const indexOfLastSalle = currentPage * recordsPerPage;
    const indexOfFirstSalle = indexOfLastSalle - recordsPerPage;
    const records = salle.slice(indexOfFirstSalle, indexOfLastSalle);

    const closeAlert = () => {
        setAlert_succes(false)
        setAlert_error(false)
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Aucun jeton');
        } else {
          fetchSalle(token);
        }
    }, []);

    const fetchSalle = async (token) => {
        setLoading(true)
        try {
            const response = await fetch(`http://127.0.0.1:3001/salle`,{
                headers:{
                    Authorization :token,
                },
            });
            const data = await response.json();
            setSalle(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    };

    const handleFormSubmit = async (e) => {

        try {
            e.preventDefault();
            const date_rdvObj = new Date(`${date_rdv}`);
            const heureDebutObj = new Date(`${date_rdv}T${heur_debut}`);
            const heureFinObj = new Date(`${date_rdv}T${heur_fin}`);
            
            const reservationData = {
                date_rdv: date_rdvObj,
                heur_debut: heureDebutObj,
                heur_fin: heureFinObj,
                trigram: trigram,
                description: description,
                //   couleur: color,
                salleID: salleID,
            };

            let result = await fetch('http://127.0.0.1:3001/reservation',
                {
                    method: 'post',
                    body: JSON.stringify(reservationData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

            if (result.ok) {
                result = await result.json();
                setDate_rdv('');
                setHeur_debut('');
                setHeur_fin('');
                setTrigram('');
                setDescription('');
                setSalleID('');
                setAlert_succes(true);
                setReservation([...reservation, result]);
            }
            else {
                result = await result.json();
                console.error(result.message)
                setAlert_error(true);
            }
        } catch (error) {
            console.log('error')
        }
    };
    return (
        <>
            <div className="">
                <div className="card bg-light" style={{ width: '100%', height: '80vh', padding: '50px' }}>
                    <div className="card-header text-center">
                        <h1>Liste des reservations par salles</h1>
                    </div>
                    <div className="card-body ">

                        {loading ? (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '40vh', // Pour centrer verticalement sur toute la hauteur de la fenêtre
                            }}><ClipLoader color="orange" size={80} /></div>
                        ) : (
                            <>
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nom salle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.length === 0 ? (
                                            <tr>
                                                <td colSpan="3">Aucune reservation n'a été trouvée.</td>
                                            </tr>
                                        ) : (
                                            records.map((salles) => (
                                                <tr key={salles._id}>
                                                    <td><a style={{
                                                        textDecoration: 'none', 
                                                        color: 'black', 
                                                        fontSize: '16px', 
                                                    }} href={`/reservation/${salles._id}`}>{salles.nomSalle}</a></td>
                                                </tr>
                                            )))}
                                    </tbody>
                                </table>
                            {/*    <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onNextPage={onNextPage}
                                    onPrevPage={onPrevPage}
                                    onPageChange={onPageChange}
                                                /> */}
                            </>)}
                    </div>

                    {alert_succes && (
                        <AlertSuccess onClose={closeAlert} paragrapheText={<p>Votre reservation ajouter avec success</p>} />
                    )
                    }
                    {
                        alert_error && (
                            <AlertError onClose={closeAlert} paragrapheText={<p>La salle est déjà réservée pour cette période.</p>} />
                        )
                    }
                    <div className="d-flex mb-3 mr-3 ">
                        <div className="p-2 ml-auto  ">
                            <button type="button" className="btn custom-btn ajouter" data-toggle="modal" data-target="#ajout_reservation"  >
                                Ajouter
                            </button>
                        </div>
                    </div>


                </div>

                <div className="modal fade" id="ajout_reservation">
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h4 className="modal-title">Ajout reservation</h4>
                                <button type="button" className="close" data-dismiss="modal">&times;</button>
                            </div>


                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="Date_rdv">Date de rendez vous</label>
                                        <input type="date"
                                            className="form-control"
                                            id="date_rdv"
                                            value={date_rdv}
                                            onChange={(e) => (setDate_rdv(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Heure_debut">Heure de debut</label>
                                        <input type="time"
                                            className="form-control"
                                            id="Heure_debut"
                                            value={heur_debut}
                                            onChange={(e) => (setHeur_debut(e.target.value))}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="Heure de fin">Heure de fin</label>
                                        <input type="time"
                                            className="form-control"
                                            id="Heure de fin"
                                            value={heur_fin}
                                            onChange={(e) => (setHeur_fin(e.target.value))}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="Trigram">Trigram</label>
                                        <input type="text"
                                            className="form-control"
                                            id="date_rdv"
                                            value={trigram}
                                            placeholder="Entrez votre trigram"
                                            onChange={(e) => (setTrigram(e.target.value))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Date">Description</label>
                                        <textarea
                                            className="form-control"
                                            value={description}
                                            placeholder="Votre description"
                                            onChange={(e) => (setDescription(e.target.value))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Liste salles">Liste des salles pour reservation</label>
                                        <select className="form-control"
                                            id="salle"
                                            onChange={(e) => setSalleID(e.target.value)}>

                                            <option value="">Sélectionnez une salle</option>
                                            {salle.map((salles) => (
                                                <option key={salles._id} value={salles._id}>
                                                    {salles.nomSalle}
                                                </option>
                                            ))}

                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn custom-btn ajouter" data-dismiss="modal" onClick={handleFormSubmit}>Enregistre</button>
                                <button type="button" className="btn custom-btn annuler" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
export default Reservation;