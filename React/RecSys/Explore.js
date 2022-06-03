import React, {Component} from 'react';
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
import {Link} from "react-router-dom";
import axios from "axios";

class Explore extends Component
{


    state = {
        save_color: 'black',
        score: 8.6,
        title: 'Bat Man II:The Dark Knight',
        rated: 24000,
        tags: ['action', 'sci-fi'],
        vid: '324468761',
        movieId: 123123,
        description: 'description of current movie description of current movie description of current movie description of current movie'
    }


    handleRateChange(value)
    {
        console.log('handleRateChange:\nlast value is ' + cookie.load('r' + this.state.movieId) + '\nnew value is' + value);
        message.success('Rating Successful!')

    }


    handlePrev()
    {
        console.log("handlePrev");
    }

    handleNext()
    {
        this.setState({movieId:Math.round(Math.random()*8000)});
        console.log("handleNext");
    }

    handleSave(e)
    {
        console.log('handleSave');
        if (this.state.save_color === 'black')
        {
            message.success('Film Saved to your anthology!');
            this.setState({save_color: 'red'});
        } else
        {
            message.success('Film removed from your anthology');
            this.setState({save_color: 'black'});
        }


    }

    handleAddTag(e)
    {
        console.log('handleAddTag');
    }

    handleClickThrough()
    {
        console.log("handleCLickThrough: ", this.state.movieId);
    }

    componentDidMount()
    {
        console.log("component did mount")


        axios.post("/svr/movieDetail", {myMovieId: this.props.myMovieId}).then((value) =>
        {
            let data = value.data
            this.setState({
                score: data.avg_rating,
                title: data.title,
                rated: data.rates,
                tags: data.genres,
                vid: data.vid,
                movieId: this.props.myMovieId,
                description: data.desc

            })
        })

        setTimeout(() =>
        {
            console.log('Click Through');
            this.handleClickThrough();
        }, 20 * 1000);
    }

    componentWillUpdate(nextProps, nextState, nextContext)
    {
        console.log(nextState);
    }

    render()
    {
        const {Panel} = Collapse;
        return (
            <Layout>
                <Header style={{backgroundColor: 'rgb(240,242,245)'}}>
                    <Row id={'header'}>
                        <Col className='talign' span={5}><h1><VideoCameraFilled/>{this.state.title}</h1></Col>
                        <Col className='talign' span={8}><Statistic title='Current Score' value={this.state.score}
                                                                    prefix={<LikeOutlined/>}/></Col>
                        <Col className='talign' span={5}><Statistic title={'Rated'} value={this.state.rated}
                                                                    prefix={<GlobalOutlined/>}/></Col>
                        <Col className='talign' span={5}><span
                            style={{fontSize: 18, fontStyle: 'bold'}}>Vote:</span><Rate
                            defaultValue={3}
                            onChange={(e) =>
                            {
                                this.handleRateChange(e);
                            }}
                            onKeyDown={(e) =>
                            {
                                this.handleRateKeyDown(e);
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
                            this.handlePrev();
                        }}
                        type={"primary"}
                        style={{width: 50, height: '100%'}}/></Sider>
                    <Content key={'iframe_display'}>
                        <iframe id={'viewport'} title={'trailer'}
                                src={'https://www.imdb.com/video/imdb/vi' + this.state.vid + '/imdb/embed?autoplay=false'}/>
                    </Content>
                    <Sider key={'sider_next'} theme={"light"} width={50}><Button type={"primary"} icon={<RightOutlined
                        style={{color: "skyblue"}}
                    />}
                                                                                 onClick={(e) =>
                                                                                 {
                                                                                     this.handleNext()
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
                                {this.state.description}
                            </Panel>
                        </Collapse>
                        </Col>
                    </Row>
                    <Row>
                        <Col className={'talign'} span={12}><RadarChartOutlined style={{color: 'skyblue'}}/>tags:
                            {
                                this.state.tags.map((item) =>
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
                            style={{color: this.state.save_color}}/>}
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
                                        this.state.tags.map((item) =>
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
                                                                                style={{color: this.state.save_color}}/>}
                                                                            onClick={(e) =>
                                                                            {
                                                                                this.handleSave(e);
                                                                            }}
                                >Save</Button></Col>
                            </Row>
                        </Panel>
                        <Panel key={2} header={'Movie Digest'}>
                            {this.state.description}
                        </Panel>

                    </Collapse>
                </Footer>
            </Layout>
        )
    }

}

export default Explore;