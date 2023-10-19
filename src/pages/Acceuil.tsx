import React, { Fragment, useRef, useState, useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { Scheduler } from "@aldabil/react-scheduler";
import { SchedulerRef } from "@aldabil/react-scheduler/types";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import HomeSharpIcon from '@mui/icons-material/HomeSharp';
import WysiwygSharpIcon from '@mui/icons-material/WysiwygSharp';
import { fr } from 'date-fns/locale';
import '../assets/style/scheduler.css';
import ExcelJS from 'exceljs';
import { useNavigate } from 'react-router-dom';


function exportToExcel(reservationData, salleData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Réservations');

  // En-têtes de colonne
  worksheet.columns = [
    { header: 'Salle', key: 'nomSalle' },
    { header: 'Trigramme', key: 'trigram' },
    { header: 'Date de reservation', key: 'date' },
    { header: "Debut de l'heure de reservation", key: 'start' },
    { header: "Fin de l'heure de reservation", key: 'end' },
    { header: 'Description', key: 'description' },
    // Ajoutez d'autres en-têtes de colonne au besoin
  ];

  // Ajoutez les données de réservation à la feuille de calcul Excel
  reservationData.forEach((reservation) => {
    const salleCorrespondante = salleData.find((salle) => salle.admin_id === reservation.admin_id);
    worksheet.addRow({
      nomSalle: salleCorrespondante ? salleCorrespondante.title : '', // Le nom de la salle correspondante
      trigram: reservation.title,
      date:reservation.date_rdv.toLocaleString(),
      start: reservation.start.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
    }),
      end: reservation.end.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
    }),
      description: reservation.description,
      // Ajoutez d'autres données au besoin
    });
  });

  // Générez le fichier Excel en mémoire
  return workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return blob;
  });
}


function Acceuil() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingReservation, setLoadingReservation] = useState(true)
  const [mode, setMode] = useState<"default" | "tabs">("default");
  const calendarRef = useRef<SchedulerRef>(null);
  const [reservation, setreservation] = useState([])
  const [salle, setSalle] = useState([]);
  //commentair pour faire rafraishir la page tout les 5 minutes
  /* useEffect(() => {
    // fetchSalle(); // Appel initial pour charger les données
     // Mettez en place un rafraîchissement périodique toutes les X millisecondes (par exemple, toutes les 5 minutes)
     const refreshInterval = setInterval(fetchSalle, 30000); // 300000 ms = 5 minutes
 
     return () => {
       // Nettoyez l'intervalle lorsque le composant est démonté pour éviter les fuites de mémoire
       clearInterval(refreshInterval);
     };
   }, []);*/

  const handleExportToExcel = async () => {
    const blob = await exportToExcel(reservation, salle);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservations.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      navigate('/connection');
    } else {
      fetchSalle(token);
    }
    fetchReservation();
  }, [])

  const isTokenExpired = (token) => {
    try {
      const parsedToken = JSON.parse(atob(token.split('.')[1]));
      const tokenExpiration = parsedToken.exp * 1000; // Convertir en millisecondes
      return Date.now() >= tokenExpiration;
    } catch (error) {
      console.error(error);
      return true; // Gérer les erreurs de décodage du token comme une expiration
    }
  };

  const fetchReservation = async () => {
    try {
      setLoadingReservation(true);//debut du chargement,activez l'indicateur de chargement
      const response = await fetch(`http://127.0.0.1:3001/reservation`);
      const donneReservation = await response.json();
      const FormattedReseration = donneReservation.map((reservation) => ({
        event_id: reservation._id,
        title: reservation.trigram,
        description: reservation.description,
        date_rdv:new Date(reservation.date_rdv),
        start: new Date(reservation.heur_debut),
        end: new Date(reservation.heur_fin),
        admin_id: reservation.salleID,
        draggable: false
      }))
      setreservation(FormattedReseration);

    }
    catch (error) {
      console.error(error)
    } finally {
      setLoadingReservation(false)
    }
  }

  const fetchSalle = async (token) => {
    try {
      setLoading(true); // Début du chargement, activez l'indicateur de chargement.
      const response = await fetch(`http://127.0.0.1:3001/salle`, {
        headers: {
          Authorization: token,
        },
      });
      const donneSalle = await response.json();
      const formattedSalle = donneSalle.map((salle) => ({
        admin_id: salle._id,
        title: salle.nomSalle,
        mobile: salle.capaciteSalle,
        avatar: "https://picsum.photos/200/300",
        color: salle.couleurSalle,
      }));
      setSalle(formattedSalle);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Fin du chargement, désactivez l'indicateur de chargement.
    }
  };
  const handleDelete = (eventId) => {
    return new Promise((resolve, reject) => {
      // En supposant que vous ayez un point de terminaison API pour supprimer l'événement par son ID
      fetch(`http://127.0.0.1:3001/reservation/${eventId}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            alert("  Reservation supprimée avec succès")
            resolve(eventId);
          } else {
            reject('Échec de la suppression de l\'événement');
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  const handleConfirm = (e, action) => {
    return new Promise((resolve, reject) => {

      if (action === 'edit') {
        fetch(`http://127.0.0.1:3001/reservation/${e.event_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trigram: e.title,
            date_rdv: new Date(e.start),
            heur_debut: new Date(e.start),
            heur_fin: new Date(e.end),
            description: e.description,
            salleID: e.admin_id
          }),
        })
          .then((response) => {
            if (response.ok) {
              resolve(e)
            } else {
              reject('Échec de la mise à jour de l\'événement');
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
      else {
        fetch(`http://127.0.0.1:3001/reservation/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trigram: e.title,
            date_rdv: new Date(e.start),
            heur_debut: new Date(e.start),
            heur_fin: new Date(e.end),
            description: e.description,
            salleID: e.admin_id
          }),
        })
          .then((response) => {
            if (response.ok) {
              alert("Reservation ajouter avec succes")
              fetchReservation()
            } else {
              alert(" La salle est réservée dans le délai que vous avez ajouté, veuillez changer.")
              reject(e);
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
    })
  }
  return (
    <Fragment>
      {loading || loadingReservation ? (
        <div className="loading-container">
          <ClimbingBoxLoader color="orange" size={30} />
        </div>
      ) : (
        <div className="content-container">
          <div className="mode-buttons" style={{ marginBottom: '10px' }}>
            <span>Toute les salles: </span>
            <Button
              color={mode === "default" ? "success" : "inherit"}
              variant={mode === "default" ? "contained" : "text"}
              size="small"
              onClick={() => {
                setMode("default");
                calendarRef.current?.scheduler?.handleState(
                  "default",
                  "resourceViewMode"
                );
              }}
            >
              Salle
            </Button>
            <Button
              color={mode === "tabs" ? "success" : "inherit"}
              variant={mode === "tabs" ? "contained" : "text"}
              size="small"
              onClick={() => {
                setMode("tabs");
                calendarRef.current?.scheduler?.handleState(
                  "tabs",
                  "resourceViewMode"
                );
              }}
            >
              Tabs
            </Button>
          </div>

          <Scheduler

            locale={fr}
            onDelete={handleDelete}
            onConfirm={handleConfirm}
            week={{
              weekDays: [2, 3, 4, 5, 6],
              startHour: 8,
              endHour: 18,
              step: 60
            }}

            day={{
              weekDays: [2, 3, 4, 5, 6],
              startHour: 8,
              endHour: 18,
              step: 60
            }}

            translations={
              {
                navigation: {
                  month: "Mois",
                  week: "Semaine",
                  day: "Jour",
                  today: "Aujourd'hui"
                },
                form: {
                  addTitle: "Ajouter réservation",
                  editTitle: "Éditer réservation",
                  confirm: "Confirmer",
                  delete: "Suppression",
                  cancel: "Annuler"
                },
                event: {
                  title: "Trigramme",
                  start: "Début",
                  end: "Fin",
                  allDay: "Tous les jours"
                }
              }
            }

            hourFormat="24"
            ref={calendarRef}
            events={reservation}
            resources={salle}
            view="day"
            resourceFields={{
              idField: "admin_id",
              textField: "title",
              subTextField: "mobile",
              avatarField: "title",
              colorField: "color"
            }}


            fields={[
              {
                name: "admin_id",
                type: "select",
                options: salle.map((res) => {
                  return {
                    id: res.admin_id,
                    text: `${res.title} (${res.mobile})`,
                    value: res.admin_id //Should match "name" property
                  };
                }),
                config: { label: "Liste des salles", required: true }
              }
              ,
              {
                name: "description",
                type: "input",
                config: { label: "Description", multiline: true, rows: 4 }
              }
            ]
            }


            viewerExtraComponent={(fields, event) => {
              return (
                <div>
                  {fields.map((field, i) => {
                    if (field.name === "admin_id") {
                      const admin = field.options.find(
                        (fe) => fe.id === event.admin_id
                      );
                      return (
                        <Typography
                          key={i}
                          style={{ display: "flex", alignItems: "center" }}
                          color="textSecondary"
                          variant="caption"
                          noWrap
                        >
                          <HomeSharpIcon />{admin.text}
                        </Typography>
                      );
                    } else {
                      return "";
                    }
                  })}
                  <Typography
                    style={{ display: "flex", alignItems: "center" }}
                    color="textSecondary"
                    variant="caption"
                    noWrap >
                    <WysiwygSharpIcon />Description : {event.description}
                  </Typography>
                </div>
              );
            }}
          />

          <div>
            <Button className="btn custom-btn ajouter" onClick={handleExportToExcel}>
              Exporter vers Excel
            </Button>
          </div>


        </div>
      )}
    </Fragment>

  );
}

export default Acceuil;
