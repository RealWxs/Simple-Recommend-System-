import React, {Component, useEffect, useState} from 'react';
import {Button, Col, Layout, Row, Rate, message, Tag, Statistic, Collapse} from "antd";
import Sider from "antd/es/layout/Sider";
import {Content, Footer, Header} from "antd/es/layout/layout";
import cookie from "react-cookies";
import {
    RightOutlined,
    LeftOutlined,
    RadarChartOutlined,
    BulbOutlined,
    HeartFilled,
    VideoCameraFilled,
    GlobalOutlined,
    FormOutlined,
    PlusOutlined,
    LikeOutlined


} from '@ant-design/icons';
import {Link, useSearchParams} from "react-router-dom";
import axios from "axios";


function NewExplore()
{
    const [params, setParams] = useSearchParams();
    const [save_color, setSaveColor] = useState('black');
    const [movieDetail, setMovieDetail] = useState({
        score: 8.6,
        title: 'Bat Man II:The Dark Knight',
        rated: 24000,
        tags: ['action', 'sci-fi'],
        vid: '324468761',
        movieId: 238,
        description: 'description of current movie description of current movie description of current movie description of current movie',
        genreId:0

    });
    // const [movieDetail, setMovieDetail] = useState({});
    const [genreId,setGenreId] = useState(-1);
    const [ctrStatus,setCtrStatus] = useState(false);
    const [timerId,setTimerId] = useState(-1);
    const [rateValue,setRateValue] = useState(0);
    useEffect(() =>
    {

        axios.post("/svr/movieDetail", {myMovieId: params.get('myMovieId')}).then((value) =>
        {
            let data = value.data
            setMovieDetail({
                score: data.avg_rating,
                title: data.title,
                rated: data.rates,
                tags: data.genres,
                vid: data.vid,
                movieId: params.get('myMovieId'),
                description: data.desc,
            })
        }).then(()=>
        {
            axios.post('/svr/fav_status',{myMovieId:params.get('myMovieId')}).then((value)=>
            {
                if (value.data.fav_status)
                {
                    setSaveColor('red')
                }
                else
                {
                    setSaveColor('black')
                }
            }).then(()=>
            {
                axios.post('/svr/rate_status',{myMovieId:params.get('myMovieId')}).then((value)=>
                {
                    let rateVal = value.data.rating;
                    if (rateVal === -1)
                    {
                        setRateValue(0);
                    }
                    else
                    {
                        setRateValue(rateVal);
                    }
                })
            })

        })
        // axios.post('/svr/fav_status',{myMovieId:params.get('myMovieId')}).then((value)=>
        // {
        //     if (value.data.fav_status)
        //     {
        //         setSaveColor('red')
        //     }
        //     else
        //     {
        //         setSaveColor('black')
        //     }
        // })
        // axios.post('/svr/rate_status',{myMovieId:params.get('myMovieId')}).then((value)=>
        // {
        //     let rateVal = value.data.rating;
        //     if (rateVal === -1)
        //     {
        //         setRateValue(0);
        //     }
        //     else
        //     {
        //         setRateValue(rateVal);
        //     }
        // })


    }, [params])
    const {Panel} = Collapse;
    useEffect(()=>
    {
        if (params.get('myMovieId')==null)
        {
            setParams({myMovieId:Math.round(Math.random()*9400)});
        }
        clearTimeout(timerId)
        let tId = setTimeout(()=>
        {
            console.log('click through');
            setCtrStatus(true);
            let username = cookie.load('currentUser')
            if (username===undefined)
            {
                console.log('not login');
            }
            else
            {
                axios.post('/svr/inc_ctr',{myMovieId:movieDetail.movieId});
            }
        },1000*20)
        setTimerId(tId);

    },[params])
    return (
        <Layout>
            <Header style={{backgroundColor: 'rgb(240,242,245)'}}>
                <Row id={'header'}>
                    <Col className='talign' span={5}><h1><VideoCameraFilled/>{movieDetail.title}</h1></Col>
                    <Col className='talign' span={8}><Statistic title='Current Score' value={movieDetail.score}
                                                                prefix={<LikeOutlined/>}/></Col>
                    <Col className='talign' span={5}><Statistic title={'Rated'} value={movieDetail.rated}
                                                                prefix={<GlobalOutlined/>}/></Col>
                    <Col className='talign' span={5}><span
                        style={{fontSize: 18, fontStyle: 'bold'}}>Vote:</span><Rate
                        value={rateValue}
                        onChange={(e) =>
                        {
                            // handle rating

                            axios.post('svr/rate',{myMovieId:movieDetail.movieId,rating:e}).then(()=>
                            {
                                setRateValue(e);
                                console.log('newValue:'+e);
                                if (e===0)
                                {
                                    message.success('undo Rating Successful!');
                                }
                                else
                                {
                                    message.success('Rating Successful!');
                                }

                            })


                        }}

                        allowHalf
                    /></Col>
                    {/*<Col>*/}
                    {/*    <Statistic title={'Vote'} value={NaN} suffix={<Rate defaultValue={3} allowHalf/> }/>*/}
                    {/*</Col>*/}
                </Row>
            </Header>

            <Layout>
                <Sider key={'sider_prev'} theme={"light"} width={50}><Button
                    className={'explore_btn'}
                    icon={<LeftOutlined style={{color: "skyblue"}}
                    />}
                    onClick={(e) =>
                    {
                        //handlePrev
                        console.log('handlePrev');
                    }}
                    type={"primary"}
                    style={{width: 50, height: '100%'}}/></Sider>
                <Content key={'iframe_display'}>
                    <iframe id={'viewport'} title={'trailer'}
                            src={'https://www.imdb.com/video/imdb/vi' + movieDetail.vid + '/imdb/embed?autoplay=false'}/>
                </Content>
                <Sider key={'sider_next'} theme={"light"} width={50}><Button type={"primary"} icon={<RightOutlined
                    style={{color: "skyblue"}}
                />}
                                                                             onClick={(e) =>
                                                                             {

                                                                                //handleNext
                                                                                 axios.post("/svr/explore_next",{lastCtr:ctrStatus,genreId:genreId}).then(
                                                                                     (value)=>
                                                                                     {
                                                                                         setParams({myMovieId:value.data.myMovieId});
                                                                                         setGenreId(value.data.genreId);
                                                                                     }

                                                                                 )
                                                                             }}
                                                                             className={'explore_btn'}
                                                                             style={{
                                                                                 width: 50,
                                                                                 height: '100%'
                                                                             }}/></Sider>
            </Layout>
            <Footer>
                {/*<Row>
                        <Col span={24}>
                        <Collapse bordered={false}>
                            <Panel header="Movie Digest" key="1">
                                {movieDetail.description}
                            </Panel>
                        </Collapse>
                        </Col>
                    </Row>
                    <Row>
                        <Col className={'talign'} span={12}><RadarChartOutlined style={{color: 'skyblue'}}/>tags:
                            {
                                movieDetail.tags.map((item) =>
                                {
                                    return (<Tag color={'processing'}><a href={'search?tag=' + item}>{item}</a></Tag>)
                                })
                            }
                            <Button shape={"circle"} size={"small"} onClick={(e) =>
                            {
                                this.handleAddTag(e);
                            }} icon={<PlusOutlined style={{color: "skyblue"}}/>}/>
                        </Col>
                        <Col className={'talign'} span={12}><Button shape={'round'} type={"ghost"} icon={<HeartFilled
                            style={{color: movieDetail.save_color}}/>}
                                                                    onClick={(e) =>
                                                                    {
                                                                        this.handleSave(e);
                                                                    }}
                        >Save</Button></Col>
                    </Row>*/}

                <Collapse defaultActiveKey={1}>
                    <Panel key={1} header={'utils'}>
                        <Row>
                            <Col className={'talign'} span={12}><RadarChartOutlined style={{color: 'skyblue'}}/>tags:
                                {
                                    movieDetail.tags.map((item) =>
                                    {
                                        return (
                                            <Tag color={'processing'}><a
                                                href={'search?tag=' + item}>{item}</a></Tag>)
                                    })
                                }
                                <Button shape={"circle"} size={"small"} onClick={(e) =>
                                {
                                    this.handleAddTag(e);
                                }} icon={<PlusOutlined style={{color: "skyblue"}}/>}/>
                            </Col>
                            <Col className={'talign'} span={12}><Button shape={'round'} type={"ghost"}
                                                                        icon={<HeartFilled
                                                                            style={{color: save_color}}/>}
                                                                        onClick={(e) =>
                                                                        {
                                                                            console.log('handleSave');
                                                                            if (save_color === 'black')
                                                                            {
                                                                                axios.post('/svr/changeFavStatus',{doSave:true,myMovieId:movieDetail.movieId}).then(()=>
                                                                                {
                                                                                    message.success('Film Saved to your anthology!');
                                                                                    setSaveColor('red');
                                                                                })

                                                                            } else
                                                                            {
                                                                                axios.post('/svr/changeFavStatus',{doSave:false,myMovieId:movieDetail.movieId}).then(()=>
                                                                                {
                                                                                    message.success('Film removed from your anthology');
                                                                                    setSaveColor('black');
                                                                                })


                                                                            }
                                                                        }}
                            >Save</Button></Col>
                        </Row>
                    </Panel>
                    <Panel key={2} header={'Movie Digest'}>
                        {movieDetail.description}
                    </Panel>

                </Collapse>
            </Footer>
        </Layout>

    )
}

export default NewExplore;