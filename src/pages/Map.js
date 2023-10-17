import { useEffect, useState } from "react";
import '../assets/style/map.css';
import { Tooltip, PopoverHeader, PopoverBody } from 'reactstrap';
import ClipLoader from "react-spinners/ClipLoader";
const Map = () => {
    const [salle, setSalle] = useState([]);
    const [hoveredSalleId, setHoveredSalleId] = useState(null);
    const [reservationData, setReservationData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reservation, setReservation] = useState([])

    const fetchReservation = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:3001/reservation`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setReservation(data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log("aucun jeton")
        } else {
            fetchSalle(token);
        }

        fetchReservation();
    }, [])



    const fetchSalle = async (token) => {
        try {
            const response = await fetch(`http://127.0.0.1:3001/salle`, {
                headers: {
                    Authorization: token,
                },
            });
            const data = await response.json();
            setSalle(data);
        } catch (error) {
            console.error(error);
        }
    };
    const handleMouseEnter = async (id, _id) => {
        setIsLoading(true);
        setHoveredSalleId(id);
        try {
            const response = await fetch(`http://127.0.0.1:3001/reservation/salle/${_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setReservationData(data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const handleMouseLeave = () => {
        setHoveredSalleId(null)
    }

    return (
        <div className="container">
            <svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 535.08 679">
                {
                    salle.map((salles) => {
                        const isSalleReserved = reservation.some((reservation) => {
                            const reservationDates = new Date(reservation.created_date); // Assurez-vous que la clé est correcte
                            const now = new Date();
                            return (
                                reservation.salleID === salles._id && // Vérifiez l'ID de la salle dans la réservation
                                reservationDates.toDateString() === now.toDateString() &&
                                now >= new Date(reservation.heur_debut) &&
                                now <= new Date(reservation.heur_fin)
                            );
                        });

                        // Déterminez la classe CSS en fonction de la disponibilité de la salle
                        const rectClassName = isSalleReserved ? "salle-occupee" : "salle-libre";

                        return (
                            <g id={salles.rect['id']}
                                key={salles._id}
                                onMouseEnter={() => handleMouseEnter(salles.rect['id'], salles._id)}
                                onMouseLeave={() => handleMouseLeave()}
                            >
                                <rect id={salles.rect['id']} data-name={salles.rect['dataName']} className={rectClassName} // Classe CSS conditionnelle
                                    x={salles.rect['x']} y={salles.rect['y']} width={salles.rect['width']} height={salles.rect['height']} />
                                <text id={salles.text['id']} data-name={salles.text['dataName']} className={salles.text['className']} transform={salles.text['transform']}><tspan className="cls-29" x="0" y="0" >{salles.nomSalle} </tspan></text>
                                {hoveredSalleId === salles.rect['id'] && (
                                    <Tooltip
                                        placement={
                                            salles.rect['id'] === 'NosyIranja-2' || salles.rect['id'] === 'NosySakatia-2'
                                                ? 'right'
                                                : 'left'
                                        }
                                        isOpen={true}
                                        autohide={false}
                                        target={salles.rect['id']}
                                        style={{ backgroundColor: 'black' }} // Définissez la couleur de fond ici
                                    >
                                        <PopoverHeader style={{ backgroundColor: 'hsl(24, 99%, 59%)' }}>
                                            <p style={{ color: 'black' }}>Reservation {salles.nomSalle}</p >
                                        </PopoverHeader>
                                        <PopoverBody>
                                            {isLoading ? (
                                                <ClipLoader color="orange" size={20} />
                                            ) : (
                                                <div style={{ color: 'white' }}>
                                                    {reservationData && reservationData.length > 0 ? (
                                                        (now => {
                                                            // Heure actuelle
                                                            const ongoingReservations = reservationData
                                                                .filter(reservation => {
                                                                    const reservationDate = new Date(reservation.date_rdv);
                                                                    return reservationDate.toLocaleDateString() === now.toLocaleDateString();
                                                                })
                                                                .filter(reservation => {
                                                                    const heureDebut = new Date(reservation.heur_debut);
                                                                    const heureFin = new Date(reservation.heur_fin);
                                                                    return heureDebut <= now && heureFin >= now;
                                                                })
                                                                .sort((reservation1, reservation2) => {
                                                                    const heureDebut1 = new Date(reservation1.heur_debut);
                                                                    const heureDebut2 = new Date(reservation2.heur_debut);
                                                                    return heureDebut1 - heureDebut2;
                                                                });

                                                            if (ongoingReservations.length > 0) {
                                                                return ongoingReservations.map((reservation, index) => (
                                                                    <div key={index}>
                                                                        <p>Date de rendez-vous: {new Date(reservation.date_rdv).toLocaleDateString()}</p>
                                                                        <p>
                                                                            Occupe à {new Date(reservation.heur_debut).toLocaleTimeString([], {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })}
                                                                        </p>
                                                                        <p>
                                                                            Jusqu'à {new Date(reservation.heur_fin).toLocaleTimeString([], {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })}
                                                                        </p>
                                                                        <p>
                                                                            Trigram : {reservation.trigram}
                                                                        </p>
                                                                    </div>
                                                                ));
                                                            } else {
                                                                return <p style={{ color: 'white' }}>Aucune réservation en cours.</p>;
                                                            }
                                                        })(new Date())
                                                    ) : (
                                                        <p style={{ color: 'white' }}>Aucune réservation disponible pour aujourd'hui.</p>
                                                    )}
                                                </div>
                                            )}
                                        </PopoverBody>
                                    </Tooltip>
                                )}
                            </g>
                        )
                    })}
                <g id="Cafe">
                    <rect id="Café" className="cls-35" x="424.44" y="501.67" width="110.14" height="131.33" />
                    <text className="cls-4" transform="translate(459.45 575.09)"><tspan className="cls-18" x="0" y="0">C</tspan><tspan x="12.03" y="0">a</tspan><tspan className="cls-43" x="22.16" y="0">f</tspan><tspan className="cls-31" x="28.01" y="0">é</tspan></text>
                </g>
                <g id="EcoleCode">
                    <rect id="EcoleCode-2" data-name="EcoleCode" className="cls-35" x="424.44" y="154.67" width="110.14" height="347" />
                    <text id="EcoleCode-3" data-name="EcoleCode" className="cls-4" transform="translate(479.3 290.26) rotate(90)"><tspan className="cls-37" x="0" y="0">Ecole du code</tspan></text>
                </g>
                <g id="OrangeFab">
                    <rect id="OrangeFFab" className="cls-35" x=".58" y="178.67" width="112.36" height="169" />
                    <text id="OrangeFab-2" data-name="OrangeFab" className="cls-4" transform="translate(6.99 268.14)"><tspan x="0" y="0">O</tspan><tspan className="cls-41" x="14.47" y="0">r</tspan><tspan x="21.23" y="0">ange </tspan><tspan className="cls-20" x="69.72" y="0">F</tspan><tspan className="cls-15" x="79" y="0">ab</tspan></text>
                </g>
                <g id="Porte">
                    <rect id="PortePrincipale" className="cls-35" x="200.94" y=".5" width="112" height="24" />
                    <rect id="Porte-2" data-name="Porte" className="cls-35" x="358.8" y=".5" width="57" height="24" />
                    <rect id="Porte-3" data-name="Porte" className="cls-35" x="84.44" y=".5" width="57" height="24" />
                    <g id="PortePrincipale-2" data-name="PortePrincipale">
                        <rect id="porte" className="cls-35" x="200.94" y="654.5" width="112" height="24" />
                        <text className="cls-2" transform="translate(212.69 673.44) scale(.87 1)"><tspan className="cls-26" x="0" y="0">P</tspan><tspan className="cls-28" x="8.25" y="0">o</tspan><tspan className="cls-11" x="17.19" y="0">r</tspan><tspan className="cls-36" x="22.9" y="0">t</tspan><tspan x="28.19" y="0">e p</tspan><tspan className="cls-46" x="49.06" y="0">r</tspan><tspan x="54.45" y="0">incipale</tspan></text>
                    </g>
                    <g id="toilette">
                        <rect id="porte-2" data-name="porte" className="cls-35" x="358.8" y="654.5" width="57" height="24" />
                        <text className="cls-7" transform="translate(365.78 673.43) scale(.77 1)"><tspan className="cls-14" x="0" y="0">T</tspan><tspan x="7.28" y="0">oilet</tspan><tspan className="cls-44" x="38.93" y="0">t</tspan><tspan x="44.48" y="0">e</tspan></text>
                    </g>
                    <g id="E_S" data-name="E/S">
                        <rect id="porte-3" data-name="porte" className="cls-35" x="84.44" y="654.5" width="57" height="24" />
                        <text className="cls-3" transform="translate(98.03 673.44) scale(1.21 1)"><tspan x="0" y="0">E/S</tspan></text>
                    </g>
                </g>
                <g id="NosyTanikely">
                    <rect className="cls-33" x=".58" y="348.56" width="112.81" height="285.67" />
                    <text className="cls-4" transform="translate(63.04 564.79) rotate(-89.95)"><tspan x="0" y="0">Nosy tanikely</tspan></text>
                </g>
                <g id="SalleMachine">
                    <rect className="cls-35" x=".5" y="42.22" width="112" height="32.89" />
                    <text className="cls-4" transform="translate(9.07 66.22) scale(.79 1)"><tspan className="cls-22" x="0" y="0">S</tspan><tspan x="10.42" y="0">alle machine</tspan></text>
                </g>
                <g id="NosyMitsio">
                    <rect className="cls-35" x="1.39" y="75.11" width="111.11" height="102.67" />
                    <text className="cls-1" transform="translate(15.63 131.01) scale(.99 1)"><tspan x="0" y="0">Nosy </tspan><tspan className="cls-24" x="39.08" y="0">M</tspan><tspan x="53.03" y="0">itsio</tspan></text>
                </g>
                <g id="salleCamera">
                    <rect className="cls-35" x="424.5" y="40.44" width="110.08" height="112.89" />
                    <text className="cls-5" transform="translate(437.91 104.74) scale(.83 1)"><tspan className="cls-23" x="0" y="0">S</tspan><tspan x="9.68" y="0">alle </tspan><tspan className="cls-25" x="42.22" y="0">C</tspan><tspan x="53.41" y="0">ame</tspan><tspan className="cls-38" x="88.88" y="0">r</tspan><tspan x="95.16" y="0">a</tspan></text>
                </g>
                <g id="Acceuil">
                    <rect className="cls-35" x="168.5" y="550.67" width="190.22" height="27.56" />
                    <text className="cls-8" transform="translate(241.28 569.04)"><tspan className="cls-27" x="0" y="0">A</tspan><tspan className="cls-19" x="8.4" y="0">cc</tspan><tspan className="cls-21" x="20.78" y="0">euil</tspan></text>
                </g>
            </svg>
        </div>
    )
}
export default Map;