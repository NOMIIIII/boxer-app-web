import React, { useState, useRef, useEffect } from "react";
import './style.css';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player'
import axios from 'axios'
import { ProgressSpinner } from 'primereact/progressspinner';
// import raw from '../base64.online.txt';
// import cartoon from '../cartoon.txt';
import { continueStatement } from "@babel/types";
import Carousel from 'react-elastic-carousel';
import Item from "./item";
import blackImage from "./A_black_image.jpg"

window.currentTimePlayer = 0;
var VideoFullLength = 0;
const baseUrl = "http://localhost:4000"
export default function NewFight() {
    
    const { _id } = useParams();
    const navigate = useNavigate()
    
    const location = useLocation();
    const playerRef = React.useRef(null)

    const playingRef = React.useRef(false)
    const playbackRef = React.useRef(0.5)
    const progressRef = React.useRef(0)
    const playIndexRef = React.useRef(0)
    const imageCurrentSelectedRef = React.useRef(0)
    const videoRef = useRef();
    const imagesRichRef = useRef([])

    const [loading, setLoading] = useState(false)

    const [file, setFile] = useState(null)
    const [progress, setProgress] = useState({});
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

    const [videoCurrentTime , setVideoCurrentTime] = useState(0)
   

    useEffect(()=>{ // WHITE BOARD STYLE
        let img1 = document.querySelector(".naumanImage"+imageCurrentSelectedRef.current) 
        if(img1){
            img1.style.border = "solid white 4px"
        }
    },[images])
    
    useEffect(()=>{ // KEYBOARD STROKES LISTNER 

        const handleKeyDown = (e) => {

            console.log("time : ",playerRef.current.getCurrentTime());
            setVideoCurrentTime(0);
            if (e.code === "Space") {
                // if(playingRef.current){
                    //     getCurrentImageInstance()
                    // }
                    // currentTimePlayer =  playerRef.current.getCurrentTime();
                    let currentT = playerRef.current.getCurrentTime();
                    setPlaying(!playingRef.current)
                    playingRef.current = !playingRef.current 

                    window.currentTimePlayer = currentT;
                    localStorage.setItem('time' , currentT)
                    playerRef.current.seekTo(Math.floor(currentT))
                    progressRef.current[playIndexRef.current] = currentT;
                 
                }
                else{
                    window.currentTimePlayer = 0;
                    if (e.code === "KeyK") {
                        // if(playingRef.current){
                            //     getCurrentImageInstance()
                // }
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
            }
        }
        
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
          };
          
    },[])

    function extractFrames(fileee) { // EXTRACT FRAMES 
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

    function dataURLtoFile(dataurl, filename) { // DATA URL TO FILE 
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
    
    const getBase64FromUrl = async (dataurl) => { // BASE&$ CONVERStION 
        if(dataurl){
            let res = await axios.post(baseUrl + "/api/videos/base64",{url:dataurl})
            dataURLtoFile('data:video/mp4;base64,'+res.data.data,'na.mp4')
        }
    }

    const onProgressChange  = () => {// On progress change Handler 
        console.log("onProgressChange",playerRef.current.getCurrentTime())
        let tempPlayedSeconds = {
            [playIndex]:playerRef.current.getCurrentTime()
        }
        setProgress(tempPlayedSeconds);
        progressRef.current = tempPlayedSeconds
        
        if(VideoFullLength == 0){
            let tempLoadedSeconds = {
                [playIndex]: playerRef.current.getDuration()
            }
            VideoFullLength = tempLoadedSeconds;
            setVideoLength(tempLoadedSeconds)
        }
    }

    const getCurrentImageSelected = (imgInd) =>  { // VIdeo change on Frame clicked 
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

    // const getCurrentImageInstance = () => { // On progress change Handler 

    //     let diffPrev=10000
    //     let diffNew=-10000
    //     let close=-10000
        
    //     imagesRichRef.current.map((item, ind) => {
    //         diffNew =  progressRef.current[playIndexRef.current] - item.timestamp

    //         if(Math.abs(diffNew) < diffPrev){
    //             diffPrev = diffNew
    //             close = ind
    //         }
    //     })
        
    //     let imgNew = document.querySelector(".naumanImage"+close) 
    //     let imgPrev = document.querySelector(".naumanImage"+imageCurrentSelectedRef.current) 
    //     if(imgNew){
    //         imgPrev.style.border = ""
    //         imgNew.style.border = "solid white 4px"
    //         imageCurrentSelectedRef.current = close
    //         playerRef.current.seekTo(imagesRichRef.current[close].timestamp)
    //         progressRef.current[playIndexRef.current] = imagesRichRef.current[close].timestamp
    //     }
        
    // }



    useEffect(() => {
        
        try {
            let id = _id

            console.log("1")
            localStorage.removeItem("time")

            axios.get(`${baseUrl}/api/videos/${id}`).then(async (data) => {
                console.log("2",data.data,data.data.markers_list)
                setFights(data.data) // It contains whole data
                playIndexRef.current = 0
                setPlayIndex(0)
                setNewFight(data.data.markers_list) // It contains only video details
                getBase64FromUrl(data.data.markers_list[0].video_url)

                setLoading(false)

                if (data.data.markers_list[0] && data.data.markers_list[0]?.battle?.fight) {

                    console.log("3")
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
                alert("Refreshing your Window")
                setLoading(false)
                navigate("/")
            })
        } catch (err) {
            
            alert("Refreshing your Window")
            navigate("/")
        }

    }, [])

    const nextVideo = async (e) => {

        if (playIndex <= fights.markers_list.length - 1) {
        
            let obj = {
                video_id: fights.markers_list[playIndex]._id,
                duration: videoLength[playIndex],
                fight: markers[playIndex]
            }
            setLoading(true)
            let res = await axios.post(baseUrl + "/api/round", obj)

            if(playIndex == fights.markers_list.length - 1){
                alert('You have covered all the videos')
                navigate("/")
                return
            }
            let id = _id
            playIndexRef.current = playIndexRef.current + 1
            setPlayIndex(playIndex + 1)
            getBase64FromUrl(fights.markers_list[playIndex + 1].video_url)
            progressRef.current = 0
            setProgress({});
            setVideoLength({})
            setBoxerAObj({})
            setBoxerBObj({})
            setBoxerA([])
            setBoxerB([])
            setPlaying(false)
            playingRef.current = false

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

    


    const boxerACall = () => {

        if (boxerName && boxerName != "") {
            const [key, value] = Object.entries(boxerA)
            let accurance = key == undefined ? getOccurrence([...boxerA, boxerName]) : getOccurrence([...boxerA[playIndex], boxerName])

            let temp = {
                [playIndex]:accurance
            } 

            setBoxerAObj(temp)
            setBoxerName(null);


            let tempMarker = {}
            let tempBoxerA = {}

            window.currentTimePlayer = localStorage.getItem('time');
            if(!Object.keys(markers).find(element => element == playIndex) && Object.keys(markers).length == 0){
                let time = window.currentTimePlayer  ? window.currentTimePlayer : progress[playIndex];
                tempMarker[playIndex] = [{ time: time, fighter: 1, name: boxerName }]
                tempBoxerA[playIndex] = [boxerName]
            }else if(!Object.keys(markers).find(element => element == playIndex) && Object.keys(markers).length > 0){
                let time = window.currentTimePlayer  ? window.currentTimePlayer : progress[playIndex];
                tempMarker = {...markers}
                tempBoxerA = {...boxerA}
                tempMarker[playIndex] = [{ time: time, fighter: 1, name: boxerName }]
                tempBoxerA[playIndex] = [boxerName]
            }else if (Object.keys(markers).find(element => element == playIndex)) {
                let time = window.currentTimePlayer  ? window.currentTimePlayer : progress[playIndex];
                tempMarker = {...markers}
                tempBoxerA = {...boxerA}
                tempMarker[playIndex] = [...markers[playIndex],{ time: time, fighter: 1, name: boxerName }]
                tempBoxerA[playIndex] = [...boxerName[playIndex],boxerName]
            }
          
    
            setMarkers(tempMarker)
            setBoxerA(tempBoxerA);
            setPlaying(!playingRef.current) 
            playingRef.current = !playingRef.current
        } else {
            alert("please enter name")
        }
        
    }
    
    const boxerBCall = () => {
        if (boxerName && boxerName != "") {
            console.log(boxerB,boxerName)
            const [key, value] = Object.entries(boxerB)
            let accurance = key == undefined ? getOccurrence([...boxerB, boxerName]) : getOccurrence([...boxerB[playIndex], boxerName])


            let temp = {
                [playIndex]:accurance
            } 
            setBoxerBObj(temp)
            setBoxerName(null);
            
            let tempMarker = {}
            let tempBoxerB = {}
            
            window.currentTimePlayer = localStorage.getItem('time');
            if(!Object.keys(markers).find(element => element == playIndex) && Object.keys(markers).length == 0){
                let time = window.currentTimePlayer  ? window.currentTimePlayer : progress[playIndex];
                tempMarker[playIndex] = [{ time: time, fighter: 2, name: boxerName }]
                tempBoxerB[playIndex] = [boxerName]
            }else if(!Object.keys(markers).find(element => element == playIndex) && Object.keys(markers).length > 0){
                let time = window.currentTimePlayer  ? window.currentTimePlayer : progress[playIndex];
                tempMarker = {...markers}
                tempBoxerB = {...boxerB}
                tempMarker[playIndex] = [{ time: time, fighter: 2, name: boxerName }]
                tempBoxerB[playIndex] = [boxerName]
            }else if (Object.keys(markers).find(element => element == playIndex)) {
                let time = window.currentTimePlayer  ? window.currentTimePlayer : progress[playIndex];
                tempMarker = {...markers}
                tempBoxerB = {...boxerB}
                tempMarker[playIndex] = [...markers[playIndex],{ time: time, fighter: 2, name: boxerName }]
                tempBoxerB[playIndex] = [...boxerName[playIndex],boxerName]
            }
            
            setMarkers(tempMarker)
            setBoxerB(tempBoxerB);
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
                            onProgress={onProgressChange}
                            playbackRate={playback}
                            ref={playerRef}
                            // light = {true}
                            // id='ReactPlayer'
                            playing={playing}
                            controls={true}
                            width="379"
                            height="300"
                            // onPlay={() => setVideoPaused(false)}
                            onPause={(e) => console.log("ONPAUSE",e, playerRef.current.getCurrentTime()) }
                            onEnded={(e) => nextVideo(e)}
                        /> : null
                    }
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
                                    style={{ width: '50%', height: '50%', marginLeft:"10px", marginRight:"10px", }} 
                                    className={"naumanImage"+i} 
                                    src={URL.createObjectURL(item)}
                                    onClick={()=> getCurrentImageSelected(i)}
                                    >

                                    </img>
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
                                {i < playIndex ? <progress style={{ cursor: "pointer", width: '100px', height: '20px', marginLeft: "10px" }} id="progress" max={videoLength[playIndex]} value={videoLength[playIndex]}>
                                    Progress
                                </progress> : 
                                i == playIndex ? <progress style={{ cursor: "pointer", width: '100px', height: '20px', marginLeft: "10px" }} id="progress" max={videoLength[playIndex]} value={progress[playIndex]}>
                                    Progress
                                </progress> :
                                    <progress style={{ cursor: "pointer", width: '100px', height: '20px', marginLeft: "10px" }} id="progress" max={0} value={0}>
                                        Progress
                                    </progress>
                                }
                                {markers[i] && markers[i].map((item, key) => {
                                    let cal = key == 0 ? -108 : -108 - key 
                                    return (<span className="triangle-down" style={{ left: `${cal}px`, borderTop: item.fighter == 2 ? "15px solid rgb(255, 3, 3)" : "15px solid rgb(29, 41, 255)" }}></span>)
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
