import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BiMessageSquareEdit } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import Pagination from "./Pagination";
import ClipLoader from "react-spinners/ClipLoader";

const ReservationDetails = () => {
    const [loading, setLoading] = useState(true);
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

    const { id } = useParams();
    const [date_rdv, setDate_rdv] = useState("");
    const [heur_debut, setHeur_debut] = useState("");
    const [heur_fin, setHeur_fin] = useState("");
    const [trigram, setTrigram] = useState("");
    const [description, setDescription] = useState("");
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [detailReservation, setDetailReservation] = useState([]);
    const [detailSalle, setDetailSalle] = useState([]);
    const totalPages = Math.ceil(detailReservation.length / recordsPerPage);
    const indexOfLastReservation = currentPage * recordsPerPage;
    const indexOfFirstReservation = indexOfLastReservation - recordsPerPage;
    const records = detailReservation.slice(
        indexOfFirstReservation,
        indexOfLastReservation
    );

    const handleEdit = (reservationID) => {
        const salles = detailReservation.find(
            (reservation) => reservation._id === reservationID
        );
        setSelectedReservation(salles);
    };

    const handleDelete = async (reservationID) => {
        try {
            await fetch(`http://127.0.0.1:3001/reservation/${reservationID}`, {
                method: "DELETE",
            });
            const deleteReservation = detailReservation.filter(
                (detailReserv) => detailReserv._id !== reservationID
            );
            setDetailReservation(deleteReservation);
            alert("Reservation supprimer avec succés");
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (reservationID) => {
        try {
            let date_rdvObj = new Date(date_rdv);
            let heureDebutObj = new Date(`${date_rdv}T${heur_debut}`);
            let heureFinObj = new Date(`${date_rdv}T${heur_fin}`);
            const response = await fetch(
                `http://127.0.0.1:3001/reservation/${reservationID}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        date_rdv: date_rdvObj,
                        heur_debut: heureDebutObj,
                        heur_fin: heureFinObj,
                        trigram: trigram,
                        description: description,
                    }),
                }
            );
            if (response.ok) {
                // Mise à jour réussie, mettre à jour l'état ou effectuer d'autres actions nécessaires
                const updatedSalle = detailReservation.map((detailReserve) => {
                    if (detailReserve._id === reservationID) {
                        detailReserve.date_rdv = date_rdvObj;
                        detailReserve.heur_debut = heureDebutObj;
                        detailReserve.heur_fin = heureFinObj;
                        detailReserve.trigram = trigram;
                        detailReserve.description = description;
                    }
                    return detailReserve;
                });
                setDetailReservation(updatedSalle);
            } else {
                // La mise à jour a échoué, gérer l'erreur
                console.error("Échec de la mise à jour");
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchDetailSalle();
        fetchDetailReservation();
    }, []);

    const fetchDetailSalle = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:3001/salle/${id}`);
            const data = await response.json();
            setDetailSalle(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailReservation = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:3001/reservation/salle/${id}`
            );
            const data = await response.json();
            setDetailReservation(data);
        } catch (error) {
            console.error(error);
        }
    };

    const [searchText, setSearchText] = useState(""); // State pour stocker le texte de recherche

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const filteredRecords = records.filter((detailReserv) => {
        const formattedDate = detailReserv.date_rdv
            ? new Date(detailReserv.date_rdv).toLocaleDateString()
            : "";
        const formattedStartTime = detailReserv.heur_debut
            ? new Date(detailReserv.heur_debut).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
            : "";
        const formattedEndTime = detailReserv.heur_fin
            ? new Date(detailReserv.heur_fin).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
            : "";
    
            

        // Vous pouvez personnaliser les champs que vous souhaitez inclure dans la recherche
        const searchFields = [
            formattedDate,
            formattedStartTime,
            formattedEndTime,
            detailReserv.trigram,
            detailReserv.description,
        ];

        return searchFields.some((field) =>
            field.toLowerCase().includes(searchText.toLowerCase())
        );
    });

    return (
        <div>
            <div
                className="card bg-light"
                style={{ width: "100%", height: "90vh", padding: "50px" }}
            >
                <div className="card-header text-center">
                    <h1>Details des reservations de la salle {detailSalle.nomSalle}</h1>
                </div>
                <div className="card-body text-center">
                    {loading ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "40vh",
                            }}
                        >
                            <ClipLoader color="orange" size={80} />
                        </div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-end  mb-3">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="Recherche"
                                        value={searchText}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Date de reservation</th>
                                        <th>Heure de debut</th>
                                        <th>Heure de fin</th>
                                        <th>Trigramme</th>
                                        <th>Description</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td>
                                                Aucune reservation de la salle {detailSalle.nomSalle} .
                                            </td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((detailReserv) => (
                                            <tr key={detailReserv._id}>
                                                <td>
                                                    {detailReserv.date_rdv
                                                        ? new Date(
                                                            detailReserv.date_rdv
                                                        ).toLocaleDateString()
                                                        : ""}
                                                </td>
                                                <td>
                                                    {detailReserv.heur_debut
                                                        ? new Date(
                                                            detailReserv.heur_debut
                                                        ).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : ""}
                                                </td>
                                                <td>
                                                    {detailReserv.heur_fin
                                                        ? new Date(
                                                            detailReserv.heur_fin
                                                        ).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : ""}
                                                </td>
                                                <td>{detailReserv.trigram}</td>
                                                <td>{detailReserv.description}</td>
                                                <td>
                                                    <button
                                                        className="edit bg-light"
                                                        data-toggle="modal"
                                                        data-target="#edit"
                                                        onClick={() => {
                                                            handleEdit(detailReserv._id);
                                                        }}
                                                    >
                                                        <BiMessageSquareEdit />
                                                    </button>
                                                    <button
                                                        className="delete bg-light"
                                                        onClick={() => {
                                                            handleDelete(detailReserv._id);
                                                        }}
                                                    >
                                                        <AiFillDelete />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onNextPage={onNextPage}
                                onPrevPage={onPrevPage}
                                onPageChange={onPageChange}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="edit_Popup">
                {selectedReservation && (
                    <div className="modal fade" id="edit">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title">
                                        Modification detail reservation
                                    </h4>
                                    <button type="button" className="close" data-dismiss="modal">
                                        &times;
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="form-group">
                                            <label htmlFor="Date_rdv">Date de rendez vous</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="date_rdv"
                                                value={date_rdv}
                                                onChange={(e) => {
                                                    setDate_rdv(e.target.value);
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="heur_debut">Heure de debut</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                id="heur_debut"
                                                value={heur_debut}
                                                onChange={(e) => {
                                                    setHeur_debut(e.target.value);
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="heur_fin">Date de Fin</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                id="date_rdv"
                                                value={heur_fin}
                                                placeholder={selectedReservation.heur_fin}
                                                onChange={(e) => {
                                                    setHeur_fin(e.target.value);
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="trigram">Trigram</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="trigram"
                                                value={trigram}
                                                placeholder={selectedReservation.trigram}
                                                onChange={(e) => {
                                                    setTrigram(e.target.value);
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="Date">Description</label>
                                            <textarea
                                                className="form-control"
                                                value={description}
                                                placeholder={selectedReservation.description}
                                                onChange={(e) => {
                                                    setDescription(e.target.value);
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn custom-btn ajouter"
                                            data-dismiss="modal"
                                            onClick={() => {
                                                handleUpdate(selectedReservation._id);
                                            }}
                                        >
                                            Enregistre
                                        </button>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn custom-btn annuler"
                                        data-dismiss="modal"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationDetails;
