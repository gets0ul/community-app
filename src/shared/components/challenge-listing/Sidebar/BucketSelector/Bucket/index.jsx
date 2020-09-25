/**
 * Regular sidebar row.
 */

import _ from 'lodash';
// import { challenge as challengeUtils } from 'topcoder-react-lib';
import { BUCKETS, BUCKET_DATA } from 'utils/challenge-listing/buckets';
import PT from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import './style.scss';

// const Filter = challengeUtils.filter;

function Bucket({
  active,
  bucket,
  // challenges,
  disabled,
  expanded,
  onClick,
  // allActiveChallengesLoaded,
  meta,
}) {
  // let countEl;
  // if (!disabled) { // !bucket.hideCount &&
  // const filter = Filter.getFilterFunction(bucket.filter);
  // const clonedChallenges = _.clone(challenges);
  // const filteredChallenges = [];
  // for (let i = 0; i < clonedChallenges.length; i += 1) {
  // if (filter(clonedChallenges[i])) {
  //   filteredChallenges.push(clonedChallenges[i]);
  // }
  // }
  const isActive = expanded ? bucket === BUCKETS.ALL : active;
  let count;
  // if (allActiveChallengesLoaded) {
  // count = challenges.filter(filter).length;
  // } else {
  switch (bucket) {
    case BUCKETS.ALL:
      count = meta.allChallengesCount;
      break;
    case BUCKETS.MY:
      count = meta.myChallengesCount;
      break;
    case BUCKETS.OPEN_FOR_REGISTRATION:
      count = meta.openChallengesCount;
      break;
    case BUCKETS.ONGOING:
      count = meta.ongoingChallengesCount;
      break;
    default:
  }
  // }
  const countEl = (
    <span styleName="right">
      {count}
    </span>
  );
  // }

  // const error = Boolean(bucket.error) && (
  //   <div styleName="errorMsg">
  //     {bucket.error}
  //   </div>
  // );

  if (isActive) {
    return (
      <div
        onClick={disabled ? _.noop : onClick}
        onKeyPress={e => (e.key === 'Enter' ? onClick() : null)}
        styleName="active bucket"
        role="presentation"
      >
        {BUCKET_DATA[bucket].name}
        {countEl}
        {/* {error} */}
      </div>
    );
  }

  return (
    <div
      onClick={disabled ? _.noop : onClick}
      onKeyPress={e => (e.key === 'Enter' ? onClick() : null)}
      role="button"
      styleName="bucket"
      tabIndex={0}
    >
      {BUCKET_DATA[bucket].name}
      {countEl}
      {/* {error} */}
    </div>
  );
}

Bucket.defaultProps = {
  active: false,
  disabled: false,
  expanded: false,
  onClick: _.noop,
  meta: {},
};

Bucket.propTypes = {
  active: PT.bool,
  bucket: PT.string.isRequired,
  // bucket: PT.shape({
  //   // hideCount: PT.bool,
  //   name: PT.string.isRequired,
  //   error: PT.string,
  //   filter: PT.any,
  // }).isRequired,
  // challenges: PT.arrayOf(PT.shape).isRequired,
  disabled: PT.bool,
  expanded: PT.bool,
  onClick: PT.func,
  meta: PT.shape(),
  // allActiveChallengesLoaded: PT.bool.isRequired,
};

const mapStateToProps = (state) => {
  const cl = state.challengeListing;
  return {
    // allActiveChallengesLoaded: cl.allActiveChallengesLoaded,
    meta: cl.meta,
  };
};

const BucketContainer = connect(
  mapStateToProps,
)(Bucket);

export default BucketContainer;
