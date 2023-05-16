import React, { useState, useRef, useEffect } from "react";
import './style.css';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player'
import sampleVideo from './videoEditting/sampleVideo.mp4'
import axios from 'axios'
import { ProgressSpinner } from 'primereact/progressspinner';
// import raw from '../base64.online.txt';
// import cartoon from '../cartoon.txt';
import { continueStatement } from "@babel/types";
import Carousel from 'react-elastic-carousel';
import Item from "./item";
import blackImage from "./A_black_image.jpg"

const baseUrl = "http://localhost:4000"
export default function NewFightId() {

    const { _id } = useParams();
    const navigate = useNavigate()
    
    const location = useLocation();
    const playerRef = React.useRef(null)

    const playingRef = React.useRef(false)
    const playbackRef = React.useRef(0.5)
    const progressRef = React.useRef(0)
    const playIndexRef = React.useRef(0)
    const videoRef = useRef();
    const imagesRichRef = useRef([])
    const imageCurrentSelectedRef = React.useRef(0)

    const [loading, setLoading] = useState(false)

    const [file, setFile] = useState(null)
    const [progress, setProgress] = useState(0);
    const [fights, setFights] = useState()

    const [video, setVideo] = useState()
    const [videoBase64, setVideoBase64] = useState(null)
    const [playback, setPlayback] = useState(1)
    const [playing, setPlaying] = useState(false)
    const [fastforward, setFastForward] = useState(1)
    const [videoLength, setVideoLength] = useState({});
    const [urls, setVideoUrls] = useState([])
    const [playIndex, setPlayIndex] = useState(0)
    
    const [images, setImages] = useState([])
   
    const [boxerA, setBoxerA] = useState([])
    const [boxerB, setBoxerB] = useState([])
    const [boxerAObj, setBoxerAObj] = useState({})
    const [boxerBObj, setBoxerBObj] = useState({})
    const [boxerName, setBoxerName] = useState(null)
    const [markers, setMarkers] = useState({})
   
    const [newFight, setNewFight] = useState([])
   

    const handleProgressClick = () => {
        setPlaying(!playingRef.current)
        playingRef.current = !playingRef.current 
    }

    useEffect(()=>{
        
        document.addEventListener('keydown', (e) => {
            console.log(playbackRef.current,progressRef.current)
            if (e.code === "Space") {
                setPlaying(!playingRef.current)
                playingRef.current = !playingRef.current 
            }
            if (e.code === "KeyK") {
                setPlaying( !playingRef.current)
                playingRef.current = !playingRef.current
            }
            if (e.code === "KeyJ" && playingRef.current) {
                setPlayback(playbackRef.current - 0.5)
                playbackRef.current = playbackRef.current - 0.5
            }
            if (e.code === "KeyL" && playingRef.current) {
                setPlayback(playbackRef.current + 0.5)
                playbackRef.current = playbackRef.current + 0.5
            }
            if (e.code === "ArrowRight") {
                playerRef.current.seekTo(progressRef.current[playIndexRef.current] + 1)
                progressRef.current[playIndexRef.current] = progressRef.current[playIndexRef.current] + 1
                // setProgress(progress + 1)
            }
            if (e.code === "ArrowLeft") {
                if(progressRef.current[playIndexRef.current] - 1 > 0){
                    playerRef.current.seekTo(progressRef.current[playIndexRef.current] - 1)
                    progressRef.current[playIndexRef.current] = progressRef.current[playIndexRef.current] - 1
                }
                // setProgress(progress - 1)
            }
        });
    },[])

    function extractFrames(fileee) {
        var video = document.createElement('video');
        var array = [];
        var arrayRich = [];
        var saveOccurence = 0;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var index = 0
        var check;

        function initCanvas(e) {
            canvas.width = this.videoWidth;
            canvas.height = this.videoHeight;
        }

        async function drawFrame(e) {
            if(this.currentTime < this.duration){
                check = false
                this.pause();
                ctx.drawImage(this, 0, 0);

                check = await new Promise((resolve, reject) => {
                    canvas.toBlob(
                    (blob) => {
                        saveOccurence = saveOccurence + 1
                        array.push(blob);
                        arrayRich.push({img:blob,timestamp:this.currentTime});
                        resolve(true)
                    },
                    "image/jpeg"
                    );
                });
                
                if (this.currentTime < this.duration - 1) {
                    index = index + 1
                    this.currentTime = this.currentTime + 1
                }else{
                    onend()
                }
            }
        }

        function saveFrame(blob,currentTime,index) {
            saveOccurence = saveOccurence + 1
            array.push(blob);
            arrayRich.push({img:blob,timestamp:currentTime});
            return true
        }

        function revokeURL(e) {
            URL.revokeObjectURL(this.src);
        }
        
        function onend(e) {

            setLoading(false)
            imagesRichRef.current = arrayRich
            setImages(array)

        }
        
        video.muted = true;

        video.addEventListener('loadedmetadata', initCanvas, false);
        video.addEventListener('timeupdate', drawFrame, false);
        video.addEventListener('ended', onend, false);

        video.src = URL.createObjectURL(fileee);
        video.play();
    }

    function dataURLtoFile(dataurl, filename) {
        setVideoBase64(dataurl)
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
            
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        let f = new File([u8arr], filename, {type:mime});

        setVideo(f)
        extractFrames(f)
    }
    
    const getBase64FromUrl = async (dataurl) => {
        if(dataurl){
            let res = await axios.post(baseUrl + "/api/videos/base64",{url:dataurl})
            dataURLtoFile('data:video/mp4;base64,'+res.data.data,'na.mp4')
        }
    }


    const getCurrentImageSelected = (imgInd) => {
        let imgNew = document.querySelector(".naumanImage"+imgInd) 
        let imgPrev = document.querySelector(".naumanImage"+imageCurrentSelectedRef.current) 
        if(imgNew){
            imgPrev.style.border = ""
            imgNew.style.border = "solid white 4px"
            imageCurrentSelectedRef.current = imgInd
            playerRef.current.seekTo(imagesRichRef.current[imgInd].timestamp)
            progressRef.current[playIndexRef.current] = imagesRichRef.current[imgInd].timestamp
        }
    }

    useEffect(()=>{
        let img1 = document.querySelector(".naumanImage"+imageCurrentSelectedRef.current) 
        if(img1){
            img1.style.border = "solid white 4px"
        }
    },[images])

    useEffect(() => {
        
        let id = _id

        axios.get(`${baseUrl}/api/videos/${id}`).then(async (data) => {
           
            setFights(data.data)
            setPlayIndex(0)
            setNewFight(data.data.markers_list)
            getBase64FromUrl(data.data.markers_list[0].video_url)
            setLoading(false)

            if (data.data.markers_list[0] && data.data.markers_list[0]?.battle?.fight) {

                let boxerA = []
                let boxerB = []
                let marker_temp_obj  = {}
                let marker_temp_arr  = []
    
                data.data.markers_list.map((vid,ind)=> {
                    marker_temp_arr  = []
                    vid.battle?.fight.map(item => {
                        marker_temp_arr.push(item)
                        marker_temp_obj[ind] = marker_temp_arr
                        if(ind == 0){
                            if (item.fighter == 1) {
                                boxerA.push(item.name)
                            } else if (item.fighter == 2) { boxerB.push(item.name) }
                        }
                    })
                })
                
                setMarkers(marker_temp_obj)

                let setOfKeys = Object.keys(marker_temp_obj).find(element => element == 0)
                
                if (setOfKeys == 0){
                    let accurance
                    let accuranceB

                    accurance = getOccurrence(boxerA)
                    accuranceB = getOccurrence(boxerB)
                    let temp = {
                        [playIndex]:accurance
                    } 
                    let tempBoxerB = {
                        [playIndex]:accuranceB
                    } 

                    setBoxerAObj(temp)
                    setBoxerBObj(tempBoxerB)

                }

                setBoxerA(boxerA);
                setBoxerB(boxerB);
            }
        }).catch(err => {
            console.log(err, '   error ');
            setLoading(false)
            alert(err)
        })

    }, [])

    const nextVideo = async (e) => {

        if (playIndex <= fights.markers_list.length - 1) {
        
            let obj = {
                video_id: fights.markers_list[playIndex]._id,
                duration: videoLength[playIndex],
                fight: markers[playIndex]
            }
            console.log(obj)
            setLoading(true)
            let res = await axios.post(baseUrl + "/api/round", obj)

            if(playIndex == fights.markers_list.length - 1){
                alert('You have covered all the videos')
                navigate("/")
                return
            }
            let id = _id
            playIndexRef.current = playIndexRef.current + 1
            getBase64FromUrl(fights.markers_list[playIndex + 1].video_url)
            progressRef.current = 0

            setProgress({});
            setVideoLength({})
            setPlaying(false)
            playingRef.current = false

            if (fights.markers_list[playIndex + 1] && fights.markers_list[playIndex + 1]?.battle?.fight) {

                let boxerA = []
                let boxerB = []

                let marker_temp_obj  = {...markers}
                let marker_temp_arr  = []
    
                fights.markers_list.map((vid,ind)=> {
                    marker_temp_arr  = []
                    vid.battle?.fight.map(item => {
                        marker_temp_arr.push(item)
                        marker_temp_obj[ind] = marker_temp_arr
                        if(ind == playIndex + 1){
                            if (item.fighter == 1) {
                                boxerA.push(item.name)
                            } else if (item.fighter == 2) { boxerB.push(item.name) }
                        }
                    })
                })
                
                setMarkers(marker_temp_obj)

                let setOfKeys = Object.keys(marker_temp_obj).find(element => element == playIndex + 1)
                
                if (setOfKeys == playIndex + 1){
                    let accurance
                    let accuranceB

                    accurance = getOccurrence(boxerA)
                    accuranceB = getOccurrence(boxerB)
                    let temp = {
                        [playIndex + 1]:accurance
                    } 
                    let tempBoxerB = {
                        [playIndex + 1]:accuranceB
                    } 

                    setBoxerAObj(temp)
                    setBoxerBObj(tempBoxerB)

                }

                setBoxerA(boxerA);
                setBoxerB(boxerB);
            }

            setPlayIndex(playIndex + 1)

        } else {
             alert('You have covered all the videos')
            navigate("/")
        }
    }

    const handleAlist = (obj) => {
        let arr = []
        Object.entries(obj).forEach(
            ([key, value]) => {
                if (value > 1) {
                    arr.push(key + "  " + value)
                } else {
                    arr.push(key)
                }
            }
        );
        return arr
    }

    

    const changeProgressHandler = (progress) =>{
        let tempLoadedSeconds = {
            [playIndex]:progress.loadedSeconds
        }
        let tempPlayedSeconds = {
            [playIndex]:progress.playedSeconds
        }
        setProgress(tempPlayedSeconds);
        progressRef.current = tempPlayedSeconds
        setVideoLength(tempLoadedSeconds)
    }


    const boxerACall = () => {

        if (boxerName && boxerName != "") {

            let accurance = getOccurrence([...boxerA, boxerName])
            let temp = {
                [playIndex]:accurance
            } 
            setBoxerAObj(temp)
            setBoxerA(boxerA => [...boxerA, boxerName]);
            setBoxerName(null);


            let tempMarker = {}

            if(!Object.keys(markers).find(element => element == playIndex) && Object.keys(markers).length == 0){
                tempMarker[playIndex] = [{ time: progress[playIndex], fighter: 1, name: boxerName }]
            }else if(!Object.keys(markers).find(element => element == playIndex) && Object.keys(markers).length > 0){
                tempMarker = {...markers}
                tempMarker[playIndex] = [{ time: progress[playIndex], fighter: 1, name: boxerName }]
            }else if (Object.keys(markers).find(element => element == playIndex)) {
                tempMarker = {...markers}
                tempMarker[playIndex] = [...markers[playIndex],{ time: progress[playIndex], fighter: 1, name: boxerName }]
            }

            setMarkers(tempMarker)
            setPlaying(!playingRef.current)
            playingRef.current = !playingRef.current
        } else {
            alert("please enter name")
        }

    }

    const boxerBCall = () => {
        if (boxerName && boxerName != "") {
            let accurance = getOccurrence([...boxerB, boxerName])
            let temp = {
                [playIndex]:accurance
            } 
            setBoxerBObj(temp)
            setBoxerB(boxerB => [...boxerB, boxerName]);
            setBoxerName(null);

            let tempMarker = {}

            if(!Object.keys(markers).find(element => element == playIndex) && Object.keys(markers).length == 0){
                tempMarker[playIndex] = [{ time: progress[playIndex], fighter: 2, name: boxerName }]
            }else if(!Object.keys(markers).find(element => element == playIndex) && Object.keys(markers).length > 0){
                tempMarker = {...markers}
                tempMarker[playIndex] = [{ time: progress[playIndex], fighter: 2, name: boxerName }]
            }else if (Object.keys(markers).find(element => element == playIndex)) {
                tempMarker = {...markers}
                tempMarker[playIndex] = [...markers[playIndex],{ time: progress[playIndex], fighter: 2, name: boxerName }]
            }

            setMarkers(tempMarker)
            setPlaying(!playingRef.current)
            playingRef.current = !playingRef.current
        } else {
            alert("please enter name")
        }
    }
    
    function getOccurrence(array) {
        var map = array.reduce(function (obj, b) {
            obj[b] = ++obj[b] || 1;
            return obj;
        }, {});
        return map
    }


    return (
        <div style={{ height: "100%", backgroundColor: '#282c34' }}>
            {loading && <div className="loader-main"><ProgressSpinner className="loader" /></div>}
            <div className="backBtnDiv">
                <button className="backBtn" onClick={() =>   navigate("/")}>
                   <img  src={require('../assets/back.png')}/> Back
                </button>
            </div>
            <div className="home-wrapper fight-sec">
                <div className="boxerA">
                    <h4>BOXER A</h4>
                    <div style={{ height: "186px", lineHeight: "0.5" }}>
                        {boxerAObj[playIndex] && handleAlist(boxerAObj[playIndex]).map(item => {
                            return <p>{item}</p>
                        })}
                    </div>
                </div>
                <div className="video-player">
                {videoBase64 !== null ?
                    <ReactPlayer
                        url={videoBase64}
                        onProgress={changeProgressHandler}
                        playbackRate={playback}
                        ref={playerRef}
                        // light = {true}
                        // id='ReactPlayer'
                        playing={playing}
                        controls={true}
                        width="379"
                        height="300"
                        // onPause={(e) => {
                        //     handlePause(e)
                        // }}
                        onEnded={(e) => nextVideo(e)}
                    /> : null
                }
   
                    <div>
                        <div className="imageContainer">
                        {/* {naumanVideo !== null ?
                            <ThumbnailExtractor   ractor count={8} maxWidth={600}
                                onCompleteDetails={onCompleteDetails} 
                                onComplete={onComplete}
                                onCapture={(e) => onCapture(e)} 
                                onStartCapture={onStartCapture} 
                                videoFile={naumanVideo} 
                                />
                            :null
                        } */}
                        </div>
                    </div>
                </div>
                <div className="boxerB">
                    <h4>BOXER B</h4>
                    <div style={{ height: "186px", lineHeight: "0.5" }}>
                        {boxerBObj[playIndex] && handleAlist(boxerBObj[playIndex]).map(item => {
                            return <p>{item}</p>
                        })}
                    </div>
                </div>

            </div >
            <div className="home-wrapper" style={{ display: "flex", justifyContent: "center" }}>
                <div className="frames-bar" style={{ marginTop: "50px" }}>
                    {images && images.length > 0 ? images.map((item, i) => {
                        return <img 
                        style={{ width: '50%', height: '50%', marginLeft:"10px", marginRight:"10px"}} 
                        className={"naumanImage"+i} 
                        src={URL.createObjectURL(item)}
                        onClick={()=> getCurrentImageSelected(i)}
                        ></img>
                        }) 
                        : ""
                    }
                </div>
            </div>
            {/* <div >
                    {images && images.length > 0 ? 
                        <Carousel breakPoints={breakPoints}>
                        {images.map((item, i) => {
                            if(item == "NoVideo"){
                                return <Item key={i}>
                                <img style={{ width: '300px', height: '200px', }} className={"naumanImage"+i} src={blackImage}></img></Item>
                            }else{
                                return <Item key={i}>
                                <img style={{ width: '300px', height: '200px', }} className={"naumanImage"+i} src={URL.createObjectURL(item)}></img></Item>
                            }
                    }) }
                        </Carousel>
                    : ""}
            </div> */}
            <div className="home-wrapper" style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: "44%", display: "flex" }}>
                    {newFight && newFight?.length > 0 && Array.from(newFight)?.map((item, i) => {
                        return <div className="videos-bar" style={{  }}>
                            <div style={{ display: 'flex', }}>
                                {i < playIndex ? <progress style={{ cursor: "pointer", width: '100px', height: '20px', marginLeft: "10px" }} onClick={() => { handleProgressClick() }} id="progress" max={videoLength[playIndex]} value={videoLength[playIndex]}>
                                    Progress
                                </progress> : 
                                i == playIndex ? <progress style={{ cursor: "pointer", width: '100px', height: '20px', marginLeft: "10px" }} onClick={() => { handleProgressClick() }} id="progress" max={videoLength[playIndex]} value={progress[playIndex]}>
                                    Progress
                                </progress> :
                                    <progress style={{ cursor: "pointer", width: '100px', height: '20px', marginLeft: "10px" }} onClick={() => { handleProgressClick() }} id="progress" max={0} value={0}>
                                        Progress
                                    </progress>
                                }
                                {markers[i] && markers[i].map((item, key) => {
                                    return (<div className="triangle-down" style={{ left: `${-108 + (item.time * 2)}px`, borderTop: item.fighter == 2 ? "15px solid rgb(255, 3, 3)" : "15px solid rgb(29, 41, 255)" }}></div>)
                                }) 
                                }
                            </div>
                            <h4 style={{ marginLeft: '25px', width: "max-content" }}>ROUND {i + 1}</h4>
                        </div>
                    })}
                </div>
            </div>
            {!playing && <div style={{ position: 'relative', top: '-153px', left: '-153px' }}>
                <input type='text' onChange={(e) => setBoxerName(e.target.value)} className="input-field" />
                <div>
                    <button onClick={() => { boxerACall() }} className="btn-boxerA" style={{ backgroundColor: 'darkblue' }}>BOXER A</button>
                    <button onClick={() => boxerBCall()} className="btn-boxerA" style={{ backgroundColor: 'brown' }}>BOXER B</button>
                </div>
            </div>}
            <div id="prevImgCanvas"></div>
        </div>
    )
};
