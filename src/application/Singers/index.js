import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import  LazyLoad, { forceCheck } from 'react-lazyload';
import { renderRoutes } from 'react-router-config';

import { categoryTypes, alphaTypes } from '../../api/config';
import { 
  getSingerList, 
  getHotSingerList, 
  changeEnterLoading, 
  changePageCount, 
  refreshMoreSingerList, 
  changePullUpLoading, 
  changePullDownLoading, 
  refreshMoreHotSingerList 
} from './store/actionCreators';

import Horizen from '../../baseUI/HorizenItem';
import Scroll from '../../baseUI/Scroll';
import Loading from '../../baseUI/Loading';

import { 
  NavContainer,
  ListContainer,
  List,
  ListItem
} from "./style";


function Singers(props) {
  const { songsCount, singerList, pageCount, pullUpLoading, pullDownLoading, enterLoading } = props;
  const { updateDispatch, getHotSingerDispatch, pullUpRefreshDispatch, pullDownRefreshDispatch } = props;

  let [category, setCategory] = useState('');
  let [alpha, setAlpha] = useState('');

  useEffect (() => {
    if (!singerList.size) {
      getHotSingerDispatch();
    }
    //eslint-disable-next-line
  }, []);

  const singerListJS = singerList ? singerList.toJS() : [];

  const enterDetail = id => {
    props.history.push(`/singers/${id}`)
  }

  // 渲染函数，返回歌手列表
  const renderSingerList = () => {
    return (
      <List>
        {
          singerListJS.map ((item, index) => {
            return (
              <ListItem 
                key={item.accountId+""+index}
                onClick={() => enterDetail(item.id)}
              >
                <div className="img_wrapper">
                  <LazyLoad placeholder={<img width="100%" height="100%" src={require('./singer.png')} alt="music"/>}>
                    <img src={`${item.picUrl}?param=200x200`} width="100%" height="100%" alt="music"/>
                  </LazyLoad>
                </div>
                <span className="name">{item.name}</span>
              </ListItem>
            )
          })
        }
      </List>
    )
  };

  let handleUpdateAlpha = (val) => {
    setAlpha(val);
    updateDispatch(category, val);
  }

  let handleUpdateCatetory = (val) => {
    setCategory(val);
    updateDispatch(val, alpha);
  }

  const handlePullUp = () => {
    pullUpRefreshDispatch (category, alpha, category === '', pageCount);
  };
  
  const handlePullDown = () => {
    pullDownRefreshDispatch (category, alpha);
  };

  return (
    <div>
      <NavContainer>
        <Horizen 
          list={categoryTypes} 
          title={"分类 (默认热门):"} 
          handleClick={handleUpdateCatetory} 
          oldVal={category}
        />
        <Horizen 
          list={alphaTypes} 
          title={"首字母:"} 
          handleClick={val => handleUpdateAlpha(val)} 
          oldVal={alpha}
        />
      </NavContainer>
      <ListContainer play={songsCount}>
        <Scroll
          onScroll = { forceCheck }
          pullUp = { handlePullUp }
          pullDown = { handlePullDown }
          pullUpLoading = { pullUpLoading }
          pullDownLoading = { pullDownLoading }
        >
          { renderSingerList() }
        </Scroll>
        { enterLoading ? <Loading></Loading> : null }
      </ListContainer>
      { renderRoutes (props.route.routes) }
    </div>
  );
}

const mapStateToProps = (state) => ({
  singerList: state.getIn(['singers', 'singerList']),
  enterLoading: state.getIn(['singers', 'enterLoading']),
  pullUpLoading: state.getIn(['singers', 'pullUpLoading']),
  pullDownLoading: state.getIn(['singers', 'pullDownLoading']),
  pageCount: state.getIn(['singers', 'pageCount']),
  songsCount: state.getIn (['player', 'playList']).size,// 尽量减少 toJS 操作，直接取 size 属性就代表了 list 的长度
});

const mapDispatchToProps = (dispatch) => ({
  getHotSingerDispatch() {
    dispatch(getHotSingerList());
  },
  updateDispatch(category, alpha) {
    dispatch(changePageCount(0)); // 由于改变了分类，所以pageCount清零
    dispatch(changeEnterLoading(true)); // 重置loading
    dispatch(getSingerList(category, alpha));
  },
  // 滑到最底部刷新部分的处理
  pullUpRefreshDispatch(category, alpha, hot, count) {
    dispatch(changePullUpLoading(true));
    dispatch(changePageCount(count+1));
    if(hot){
      dispatch(refreshMoreHotSingerList());
    } else {
      dispatch(refreshMoreSingerList(category, alpha));
    }
  },
  // 顶部下拉刷新
  pullDownRefreshDispatch(category, alpha) {
    dispatch(changePullDownLoading(true));
    dispatch(changePageCount(0)); // 属于重新获取数据
    if(category === '' && alpha === ''){
      dispatch(getHotSingerList());
    } else {
      dispatch(getSingerList(category, alpha));
    }
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singers));