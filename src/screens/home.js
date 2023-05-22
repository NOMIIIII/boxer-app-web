import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import "./style.css";
import axios from "axios";
import { ProgressSpinner } from "primereact/progressspinner";
import swal from "sweetalert";
import AddImage from "../assets/addImage.svg"
// const baseUrl = "https://boxer-app-backend.onrender.com"
const baseUrl = "http://localhost:4000";

const Home = () => {
  const navigate = useNavigate();

  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [modalIsListOpen, setIsListOpen] = React.useState(false);
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      backgroundColor: "#D9D9D9",
      border: "10px solid #A6A6A6",
      borderRadius: "0px",
      marginRight: "-50%",
      width: "55%",
      height: "60%",
      transform: "translate(-50%, -50%)",
    },
  };

  const [fights, setFights] = useState();
  const [list, setList] = React.useState();

  // const [file, setFile] = React.useState();
  // const [rounds, setRounds] = React.useState();
  // const [videos, setVideos] = React.useState();


  const [file, setFile] = React.useState([]);
  const [rounds, setRounds] = React.useState([]);
  const [videos, setVideos] = React.useState([]);

  const [weight, setWeight] = useState();
  const [weightClass, setWeightClass] = useState();
  const [blue_boxer_name, setBlueBoxerName] = useState();
  const [red_boxer_name, setRedBoxerName] = useState();
  const [fight_date, setFightDate] = useState();
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState();
  const [weightClasses, setWeightClasses] = React.useState([
    "light flyweight",
    "flyweight",
    "super flyweight",
    "bantamweight",
    "super bantamweight",
    "featherweight",
    "super featherweight",
    "lightweight",
    "super lightweight",
    "welterweight",
    "super welterweight",
    "middleweight",
    "super middleweight",
    "light heavyweight",
    "cruiserweight",
    "heavyweight"
  ]);
  
  const onWeightChange = (weight) => {
    setWeight(weight);
    let filtered = fights.filter((item) => item.weight_class == weight);
    setList(filtered);
  };
  const filterList = (text) => {
    console.log(text, "  text");
    if (!text && text == "") {
      if (weight && weight != "") {
        onWeightChange(weight);
      } else {
        setList(fights);
      }
    } else {
      if (weight && weight != "") {
        let filtered = list.filter((item) =>
          (item.blue_boxer_name + item.red_boxer_name)
            .toLocaleLowerCase()
            .includes(text.toLocaleLowerCase())
        );
        setList(filtered);
      } else {
        let filtered = fights.filter((item) =>
          (item.blue_boxer_name + item.red_boxer_name)
            .toLocaleLowerCase()
            .includes(text.toLocaleLowerCase())
        );
        setList(filtered);
      }
    }
  };

  // function handleChange(e) {
  //   onSelect(e);
  //   let arr = [];
  //   if (
  //     e.target.files &&
  //     e.target.files.length > 0 &&
  //     e.target.files.length < 15
  //   ) {
  //     setVideos(e.target.files);
  //     for (let i = 0; i < e.target.files.length; i++) {
  //       const element = e.target.files[i];
  //       let url = URL.createObjectURL(element);
  //       let obj = {
  //         url,
  //         id: i,
  //       };
  //       arr.push(obj);
  //     }
  //   }
  //   setFile(arr);
  //   setRounds(e.target.files);
  // }

  function handleChange(e) {
    onSelect(e);
    let arr = [];
    let tempFile = {...e.target.files};
    let anotherTemp = []

    if (
      e.target.files &&
      e.target.files.length > 0 &&
      e.target.files.length < 15
    ) {

      for (let i = 0; i < e.target.files.length; i++) {
        const element = e.target.files[i];
        let url = URL.createObjectURL(element);
        let obj = {
          url,
          id: i,
        };
        arr.push(obj);
        anotherTemp.push(e.target.files[i])
      }

      if(file.length){

        anotherTemp = []

        for (let index = 0; index < file.length; index++) {
          arr.push(file[index]);
          tempFile[e.target.files.length + 1] = rounds[index]
        }
  
        const reversedKeys = Object.keys(tempFile).reverse();
  
        arr.reverse()
        reversedKeys.forEach(key => {
          anotherTemp.push(tempFile[key])
        });
  
      }
    }
    

    setFile(arr);
    setRounds(anotherTemp);
    setVideos(anotherTemp);
    console.log(arr,anotherTemp)
  }

  function onSelect(e) {
    if (e.target.files.length > 15) {
      alert("Only 15 files accepted.");
      e.preventDefault();
    }
  }
  const readyToGo = (e) => {
    setLoading(true);
    e.preventDefault();
    // if (!!!red_boxer_name || !!!blue_boxer_name || !!!fight_date || !!!file || file.length <= 0 || !!!weightClass) {
    //     setLoading(false)
    //     return alert("Please fill form correctly")
    // }
    if (!!!red_boxer_name) {
      setLoading(false);
      return swal("Error!", "Please enter red boxer name!", "error");
    }
    if (!!!blue_boxer_name) {
      setLoading(false);
      return swal("Error!", "Please enter blue boxer name!", "error");
    }
    if (!!!fight_date) {
      setLoading(false);
      return swal("Error!", "Please select figth date!", "error");
    }
    if (!!!file || file.length <= 0) {
      setLoading(false);
      return swal("Error!", "Please choose file!", "error");
    }
    if (!!!weightClass) {
      setLoading(false);
      return swal("Error!", "Please choose weight!", "error");
    }
    let formData = new FormData();
    console.log(rounds, "   fight rounds");
    Array.from(rounds).map((item) => {
      formData.append("rounds", item);
    });
    formData.set("red_boxer_name", red_boxer_name);
    formData.append("blue_boxer_name", blue_boxer_name);
    formData.append("fight_date", fight_date);
    formData.append("weight_class", weightClass);
    formData.append("rounds", rounds);
    formData.append("baseUrl", baseUrl);

    axios
      .post(baseUrl + "/api/videos", formData)
      .then((res) => {
        //     console.log(res, '  data');
        setLoading(false);
        sessionStorage.setItem("_id", res.data._id);

        // window.location.reload()
        navigate("/fight/" + res.data._id, { state: { videos: videos } });
      })
      .catch((err) => {
        setLoading(false);
        alert(err);
        throw err;
      });
  };
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${baseUrl}/api/videos`)
      .then((data) => {
        setFights(data.data);
        let arr = [];
        // data.data.map(item => {
        //     fetch(item.thumbnail, {
        //         method: 'GET',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //     })
        //         .then((response) => response.blob())
        //         .then((blob) => {
        //             // Create blob link to download
        //             const url = window.URL.createObjectURL(
        //                 new Blob([blob]),
        //             );
        //             item.thumbnail = blob

        //             console.log(url);
        //             arr.push(item)
        //         })
        // })

        setList(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err, "   error ");
        setLoading(false);
        throw err;
      });
  }, []);

  const removeItem = (id) => {
    let findIndex = file.findIndex((item => item.id == id))
    let filter = file.filter((item) => item.id != id);

    let tempVid = [...videos]
    let tempRounds = [...rounds]

    tempVid.pop(findIndex)
    tempRounds.pop(findIndex)

    setFile(filter);
    setVideos(tempVid)
    setRounds(tempRounds)
  };

  const fightWithId = (details) => {
    navigate("/fight/" + details._id, { state: { videos: videos } });
  };

  const handleImageClick = () => {
    const inputFile = document.getElementById('fileInput');
    inputFile.click();
  };

  return (
    <div style={{ backgroundColor: "#282c34", height: "100%" }}>
      {loading && (
        <div className="loader-main">
          <ProgressSpinner className="loader" />
        </div>
      )}

      <header className="App-header">
        <div className="home-btns">
          <button onClick={() => setIsListOpen(true)} className="home-btn">
            Fight List
          </button>
          <button onClick={() => setIsOpen(true)} className="home-btn">
            New Fight
          </button>
        </div>
      </header>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        style={customStyles}
      >
        <form>
            
          <div className="input-wrapper">
            <div className="form-heading">BLUE CORNER BOXER'S NAME</div>
            <input
              placeholder="Enter name"
              className="form-input"
              onChange={(e) => setBlueBoxerName(e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <span className="form-heading">RED CORNER BOXER'S NAME</span>
            <input
              placeholder="Enter name"
              className="form-input"
              onChange={(e) => setRedBoxerName(e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <span className="form-heading">FIGHT DATE</span>
            <input
              type="date"
              style={{
                padding: "10px",
              }}
              className="form-input"
              onChange={(e) => setFightDate(e.target.value)}
            />
          </div>
          <div className="" style={{ width: "100%", display: "flex" }}>
            <span style={{ marginLeft: "10px" }} className="form-heading">
              ROUNDS
            </span>
            <div style={{ cursor: "pointer", margin: "20px 10px 10px 20px", position: "relative", width: "10%", height: "80px", overflow: "hidden", backgroundColor: "white", padding: "5px" }}>
              <img alt='' src={AddImage} className="addImage"  onClick={handleImageClick}/>
              <input hidden multiple id="fileInput" type="file" accept="video/mp4,video/x-m4v,video/*" onChange={handleChange} />
            </div>
            <div className="selected-videos">
              {file &&
                file.length > 0 &&
                file.map((item, i) => {
                  return (
                    <>
                      <div style={{ marginTop: "10px", position: "relative" }}>
                        <div
                          onClick={() => {
                            removeItem(item.id);
                          }}
                          className="marker"
                        >x</div>
                        <video
                          style={{ marginLeft: "20px" }}
                          src={item.url}
                          height="80px"
                        />
                        <p className="rounds-bottom-txt">
                          {"ROUND " + (i + 1)}
                        </p>
                      </div>
                    </>
                  );
                })}
            </div>
          </div>
          <div className="input-wrapper">
            <span style={{ marginTop: 5 }} className="form-heading">
              WEIGHT CLASS
            </span>
            <select
              name="weight"
              onChange={(e) => setWeightClass(e.target.value)}
              className="weight-class"
              id="weight"
            >
              <option value="" className="options">Choose WeightClass</option>
              {weightClasses.map((val) => {
                return <option value={val} className="options">{val}</option>
              })}
            </select>
          </div>
          <button
            className="ready-to-go"
            onClick={(e) => {
              readyToGo(e);
            }}
          >
            READY TO GO
          </button>
        </form>
      </Modal>
      <Modal
        isOpen={modalIsListOpen}
        onRequestClose={() => setIsListOpen(false)}
        style={customStyles}
      >
        <div>
          <button className="backBtn mb-5" onClick={() =>   setIsListOpen(false)}>
              <img  src={require('../assets/back.png')}/> Back
          </button>
        </div>
        <div className="input-wrapper" style={{
              justifyContent: "center",
              alignItems: "center",
              fontSize: "20px"
        }}>
          <div style={{ marginTop: 5}}>SEARCH</div>
          <input
          style={{
            width:"50%",
            height: "43px"
          }}
            className="form-input"
            placeholder="Enter name"
            onChange={(e) => filterList(e.target.value)}
          />
          <select
            style={{
              width: "22.5%"
            }}
            name="weight"
            onChange={(e) => onWeightChange(e.target.value)}
            className="weight-class"
            id="weight"
          >
            <option value="">Any WeightClass</option>
            {weightClasses.map((val) => {
                return <option value={val}>{val}</option>
              })}
          </select>
        </div>
        <div className="list-wrapper">
          {list &&
            list.length > 0 &&
            list.map((item) => {
              return (
                <>
                  <div style={{ marginTop: "20px", display: "flex" }}>
                    <img
                      width={110}
                      height={110}
                      src={item?.thumbnail}
                      alt=""
                      style={{ cursor: "pointer",objectFit: "cover" }}
                      onClick={() => fightWithId(item)}
                    />
                    <div style={{ marginLeft: "20px" }}>
                      <label className="heading">
                        {item?.blue_boxer_name + " VS " + item?.red_boxer_name}
                      </label>
                      <div className="subHeading" style={{ display: "flex" }}>
                        <p>{item?.weight_class} - </p>
                        <p style={{marginLeft: "2px"}}>{item?.fight_date}</p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
        </div>
      </Modal>
    </div>
  );
};

export default Home;
