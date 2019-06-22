/**
 * Child component of Settings/Profile/ renders the
 * 'Education' page.
 */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable no-undef */
import React from 'react';
import PT from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import Select from 'components/Select';
import ConsentComponent from 'components/Settings/ConsentComponent';
import { PrimaryButton } from 'topcoder-react-ui-kit';
import DatePicker from 'components/challenge-listing/Filters/DatePicker';
import dropdowns from './dropdowns.json';
import EducationList from './List';

import './styles.scss';


export default class Education extends ConsentComponent {
  constructor(props) {
    super(props);
    this.onHandleDeleteEducation = this.onHandleDeleteEducation.bind(this);
    this.onDeleteEducation = this.onDeleteEducation.bind(this);
    this.onUpdateSelect = this.onUpdateSelect.bind(this);
    this.loadEducationTrait = this.loadEducationTrait.bind(this);
    this.onUpdateInput = this.onUpdateInput.bind(this);
    this.onHandleAddEducation = this.onHandleAddEducation.bind(this);
    this.onAddEducation = this.onAddEducation.bind(this);
    this.loadPersonalizationTrait = this.loadPersonalizationTrait.bind(this);
    this.updatePredicate = this.updatePredicate.bind(this);
    this.onUpdateDate = this.onUpdateDate.bind(this);

    const { userTraits } = props;
    this.state = {
      formInvalid: false,
      errorMessage: '',
      educationTrait: this.loadEducationTrait(userTraits),
      personalizationTrait: this.loadPersonalizationTrait(userTraits),
      newEducation: {
        type: '',
        schoolCollegeName: '',
        major: '',
        timePeriodFrom: '',
        timePeriodTo: '',
        graduated: false,
      },
      isMobileView: false,
      screenSM: 767,
    };
  }

  componentDidMount() {
    this.updatePredicate();
    window.addEventListener('resize', this.updatePredicate);
  }

  componentWillReceiveProps(nextProps) {
    const educationTrait = this.loadEducationTrait(nextProps.userTraits);
    const personalizationTrait = this.loadPersonalizationTrait(nextProps.userTraits);
    this.setState({
      educationTrait,
      personalizationTrait,
      formInvalid: false,
      errorMessage: '',
      newEducation: {
        type: '',
        schoolCollegeName: '',
        major: '',
        timePeriodFrom: '',
        timePeriodTo: '',
        graduated: false,
      },
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatePredicate);
  }

  /**
   * Check form fields value,
   * Invalid value, can not save
   * @param newEducation object
   */
  onCheckFormValue(newEducation) {
    let invalid = false;
    let dateInvalid = false;
    let errorMessage = '';
    let dateCount = 0;
    let dateError = '';
    let haveDate = false;

    if (!_.trim(newEducation.type).length) {
      errorMessage += 'Type, ';
      invalid = true;
    }

    if (!_.trim(newEducation.schoolCollegeName).length) {
      errorMessage += 'Name, ';
      invalid = true;
    }

    if (!_.trim(newEducation.major).length) {
      errorMessage += 'Major, ';
      invalid = true;
    }

    if (errorMessage.length > 0) {
      errorMessage += ' cannot be empty';
    }

    const fromDate = new Date(newEducation.timePeriodFrom).getTime();
    const toDate = new Date(newEducation.timePeriodTo).getTime();

    if (fromDate > toDate) {
      dateError += 'From Date value should be smaller than To Date value. ';
      dateInvalid = true;
      haveDate = true;
    }

    if (!haveDate) {
      if (!_.trim(newEducation.timePeriodFrom).length) {
        dateError += 'From Date, ';
        dateInvalid = true;
        dateCount += 1;
      }

      if (!_.trim(newEducation.timePeriodTo).length) {
        dateError += 'To Date, ';
        dateInvalid = true;
        dateCount += 1;
      }
      if (dateError.length > 0) {
        dateError = `The ${dateError} ${dateCount > 1 ? 'are' : 'is'} incomplete or ${dateCount > 1 ? 'have' : 'has'} an invalid date.`;
      }
    }


    if (errorMessage.length > 0) {
      errorMessage = `${errorMessage}. \n${dateError}`;
    } else if (dateError.length > 0) {
      errorMessage = dateError;
      invalid = dateInvalid;
    }

    this.setState({ errorMessage, formInvalid: invalid });
    return invalid;
  }

  onHandleDeleteEducation(indexNo) {
    this.showConsent(this.onDeleteEducation.bind(this, indexNo));
  }

  onUpdateDate(date, timePeriod) {
    if (date) {
      const { newEducation: oldEducation } = this.state;
      const newEducation = { ...oldEducation };
      newEducation[timePeriod] = date;
      this.setState({ newEducation });
    }
  }

  /**
   * Delete education by index
   * @param indexNo the education index no
   */
  onDeleteEducation(indexNo) {
    const { educationTrait } = this.state;
    const newEducationTrait = { ...educationTrait };
    newEducationTrait.traits.data.splice(indexNo, 1);
    this.setState({
      educationTrait: newEducationTrait,
    });

    const {
      handle,
      tokenV3,
      updateUserTrait,
      deleteUserTrait,
    } = this.props;

    if (newEducationTrait.traits.data.length > 0) {
      updateUserTrait(handle, 'education', newEducationTrait.traits.data, tokenV3);
    } else {
      deleteUserTrait(handle, 'education', tokenV3);
    }
  }

  /**
   * Add new education
   * @param answer user consent answer value
   */
  onAddEducation(answer) {
    const { newEducation, personalizationTrait } = this.state;

    if (this.onCheckFormValue(newEducation)) {
      return;
    }

    const {
      handle,
      tokenV3,
      updateUserTrait,
      addUserTrait,
    } = this.props;

    const { educationTrait } = this.state;

    newEducation.timePeriodFrom = new Date(newEducation.timePeriodFrom).getTime();
    newEducation.timePeriodTo = new Date(newEducation.timePeriodTo).getTime();

    if (educationTrait.traits && educationTrait.traits.data.length > 0) {
      const newEducationTrait = { ...educationTrait };
      newEducationTrait.traits.data.push(newEducation);
      this.setState({ educationTrait: newEducationTrait });
      updateUserTrait(handle, 'education', newEducationTrait.traits.data, tokenV3);
    } else {
      const newEducations = [];
      newEducations.push(newEducation);
      const traits = {
        data: newEducations,
      };
      this.setState({ educationTrait: { traits } });
      addUserTrait(handle, 'education', newEducations, tokenV3);
    }
    const empty = {
      type: '',
      schoolCollegeName: '',
      major: '',
      timePeriodFrom: '',
      timePeriodTo: '',
      graduated: false,
    };
    this.setState({ newEducation: empty });
    // save personalization
    if (_.isEmpty(personalizationTrait)) {
      const personalizationData = { userConsent: answer };
      addUserTrait(handle, 'personalization', [personalizationData], tokenV3);
    } else {
      const trait = personalizationTrait.traits.data[0];
      if (trait.userConsent !== answer) {
        const personalizationData = { userConsent: answer };
        updateUserTrait(handle, 'personalization', [personalizationData], tokenV3);
      }
    }
  }

  /**
   * Update input value
   * @param e event
   */
  onUpdateInput(e) {
    const { newEducation: oldEducation } = this.state;
    const newEducation = { ...oldEducation };
    newEducation[e.target.name] = e.target.type !== 'checkbox' ? e.target.value : e.target.checked;
    this.setState({ newEducation });
  }

  /**
   * Update select value
   * @param option selected value
   */
  onUpdateSelect(option) {
    if (option) {
      const { newEducation: oldEducation } = this.state;
      const newEducation = { ...oldEducation };
      newEducation[option.key] = option.name;
      this.setState({ newEducation });
    }
  }

  /**
   * Show User Consent Modal
   * @param e event
   */
  onHandleAddEducation(e) {
    e.preventDefault();
    const { newEducation } = this.state;
    if (this.onCheckFormValue(newEducation)) {
      return;
    }
    this.showConsent(this.onAddEducation.bind(this));
  }

  /**
   * Get education trait
   * @param userTraits the all user traits
   */
  loadEducationTrait = (userTraits) => {
    const trait = userTraits.filter(t => t.traitId === 'education');
    const educations = trait.length === 0 ? {} : trait[0];
    return _.assign({}, educations);
  }

  /**
   * Get personalization trait
   * @param userTraits the all user traits
   */
  loadPersonalizationTrait = (userTraits) => {
    const trait = userTraits.filter(t => t.traitId === 'personalization');
    const personalization = trait.length === 0 ? {} : trait[0];
    return _.assign({}, personalization);
  }

  updatePredicate() {
    const { screenSM } = this.state;
    this.setState({ isMobileView: window.innerWidth <= screenSM });
  }

  render() {
    const {
      settingsUI,
    } = this.props;
    const {
      educationTrait,
      isMobileView,
    } = this.state;
    const tabs = settingsUI.TABS.PROFILE;
    const currentTab = settingsUI.currentProfileTab;
    const containerStyle = currentTab === tabs.EDUCATION ? '' : 'hide';
    const educationItems = educationTrait.traits
      ? educationTrait.traits.data.slice() : [];
    const { newEducation, formInvalid, errorMessage } = this.state;


    return (
      <div styleName={containerStyle}>
        {
          this.shouldRenderConsent() && this.renderConsent()
        }
        <div styleName="education-container">
          <div styleName={`error-message ${formInvalid ? 'active' : ''}`}>
            { errorMessage }
          </div>
          <h1>
            Education
          </h1>
          <div styleName={`sub-title ${educationItems.length > 0 ? '' : 'hidden'}`}>
            Your education
          </div>
          {
            !isMobileView && educationItems.length > 0
            && (
              <EducationList
                educationList={{ items: educationItems }}
                onDeleteItem={this.onDeleteEducation}
              />
            )
          }
          <div styleName={`sub-title ${educationItems.length > 0 ? 'second' : 'first'}`}>
            Add a new education
          </div>
          <div styleName="form-container-default">
            <form name="device-form" noValidate autoComplete="off">
              <div styleName="row">
                <div styleName="field col-1">
                  <label htmlFor="educationType">
                    Type
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <span styleName="text-required">* Required</span>
                  <Select
                    name="type"
                    options={dropdowns.type}
                    onChange={this.onUpdateSelect}
                    value={newEducation.type}
                    placeholder="School"
                    labelKey="name"
                    valueKey="name"
                    clearable={false}
                  />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-1">
                  <label htmlFor="name">
                    Name
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <span styleName="text-required">* Required</span>
                  <input id="schoolCollegeName" name="schoolCollegeName" type="text" placeholder="Name" onChange={this.onUpdateInput} value={newEducation.schoolCollegeName} maxLength="64" required />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-1">
                  <label htmlFor="major">
                    Major
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <span styleName="text-required">* Required</span>
                  <input id="major" name="major" type="text" placeholder="Major" onChange={this.onUpdateInput} value={newEducation.major} maxLength="64" required />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-1">
                  <label htmlFor="timePeriodFrom">
                    From
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <span styleName="text-required">* Required</span>
                  <DatePicker
                    readOnly
                    numberOfMonths={1}
                    isOutsideRange={moment()}
                    date={newEducation.timePeriodFrom}
                    id="date-from1"
                    onDateChange={date => this.onUpdateDate(date, 'timePeriodFrom')}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-1">
                  <label htmlFor="timePeriodTo">
                    To
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <span styleName="text-required">* Required</span>
                  <DatePicker
                    readOnly
                    numberOfMonths={1}
                    isOutsideRange={moment()}
                    date={newEducation.timePeriodTo}
                    id="date-to1"
                    onDateChange={date => this.onUpdateDate(date, 'timePeriodTo')}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-1">
                  <label htmlFor="graduated">
                    Graduated
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <div styleName="tc-checkbox">
                    <input
                      name="graduated"
                      checked={newEducation.graduated}
                      id="graduated"
                      onChange={this.onUpdateInput}
                      type="checkbox"
                    />
                    <label htmlFor="graduated">
                      <div styleName="tc-checkbox-label">
                        &nbsp;
                      </div>
                      <input type="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </form>
            <div styleName="button-save">
              <PrimaryButton
                styleName="complete"
                onClick={this.onHandleAddEducation}
              >
                Add education to your list
              </PrimaryButton>
            </div>
          </div>
          <div styleName="form-container-mobile">
            <form name="education-form" noValidate autoComplete="off">
              <div styleName="row">
                <p>
                  Add Education
                </p>
              </div>
              <div styleName="row">
                <div styleName="field col-1">
                  <label htmlFor="type">
                    Type
                    <input type="hidden" />
                  </label>
                  <Select
                    name="type"
                    options={dropdowns.type}
                    onChange={this.onUpdateSelect}
                    value={newEducation.type}
                    placeholder="School"
                    labelKey="name"
                    valueKey="name"
                    clearable={false}
                  />
                </div>
                <div styleName="field col-2">
                  <label htmlFor="schoolCollegeName">
                    Name
                    <input type="hidden" />
                  </label>
                  <input id="schoolCollegeName" name="schoolCollegeName" type="text" placeholder="Name" onChange={this.onUpdateInput} value={newEducation.schoolCollegeName} maxLength="64" required />
                </div>
                <div styleName="field col-3">
                  <label htmlFor="major">
                    Major
                    <input type="hidden" />
                  </label>
                  <input id="major" name="major" type="text" placeholder="Major" onChange={this.onUpdateInput} value={newEducation.major} maxLength="64" required />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-date">
                  <label htmlFor="timePeriodFrom">
                    From
                    <input type="hidden" />
                  </label>
                  <DatePicker
                    readOnly
                    numberOfMonths={1}
                    isOutsideRange={moment()}
                    date={newEducation.timePeriodFrom}
                    id="date-from2"
                    onDateChange={date => this.onUpdateDate(date, 'timePeriodFrom')}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div styleName="field col-date">
                  <label htmlFor="timePeriodTo">
                    To
                    <input type="hidden" />
                  </label>
                  <DatePicker
                    readOnly
                    numberOfMonths={1}
                    isOutsideRange={moment()}
                    date={newEducation.timePeriodTo}
                    id="date-to2"
                    onDateChange={date => this.onUpdateDate(date, 'timePeriodTo')}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div styleName="field col-checkbox">
                  <div styleName="tc-checkbox">
                    <input
                      name="graduated"
                      checked={newEducation.graduated}
                      id="graduated"
                      onChange={this.onUpdateInput}
                      type="checkbox"
                    />
                    <label htmlFor="graduated">
                      <div styleName="tc-checkbox-label">
                        Graduated
                      </div>
                      <input type="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </form>
            <div styleName="button-save">
              <PrimaryButton
                styleName="complete"
                onClick={this.onHandleAddEducation}
              >
                Add Education
              </PrimaryButton>
            </div>
          </div>
          {
            isMobileView && educationItems.length > 0
            && (
              <EducationList
                educationList={{ items: educationItems }}
                onDeleteItem={this.onHandleDeleteEducation}
              />
            )
          }
        </div>
      </div>
    );
  }
}

Education.propTypes = {
  tokenV3: PT.string.isRequired,
  handle: PT.string.isRequired,
  userTraits: PT.array.isRequired,
  addUserTrait: PT.func.isRequired,
  updateUserTrait: PT.func.isRequired,
  deleteUserTrait: PT.func.isRequired,
  settingsUI: PT.shape().isRequired,
};
