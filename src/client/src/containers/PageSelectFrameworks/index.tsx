import * as React from "react";
import { connect } from "react-redux";

import SelectBackEndFramework from "./SelectBackendFramework";
import SelectFrontEndFramework from "./SelectFrontEndFramework";

import {
  EXTENSION_MODULES,
  EXTENSION_COMMANDS,
  WIZARD_CONTENT_INTERNAL_NAMES,
  FRAMEWORK_TYPE
} from "../../utils/constants";

import {getFrameworks} from "../../utils/extensionService/extensionService";
import { parseFrameworksPayload } from "../../utils/parseFrameworksPayload";
import { ISelectFrameworksProps, IDispatchProps } from "./interfaces";
import {mapDispatchToProps, mapStateToProps} from "./store";
import FrameworkCard from "./FrameworkCard";

type Props = ISelectFrameworksProps & IDispatchProps;

const SelectFrameworks = (props:Props) => {
  const { frontendOptions, backendOptions } = props;
  React.useEffect(()=>{
    getFrameworksListAndSetToStore();
    getDependencyInfoAndSetToStore();
  },[]);

  const getFrameworksListAndSetToStore = () =>{
    const { vscode, isPreview, setFrontendFrameworks, setBackendFrameworks } = props;
    const frameworkListLoaded = frontendOptions && frontendOptions.length>0 &&
      backendOptions && backendOptions.length>0;

    if (!frameworkListLoaded){
      getFrameworks({
        module: EXTENSION_MODULES.CORETS,
        command: EXTENSION_COMMANDS.GET_FRAMEWORKS,
        payload: {
          isPreview: isPreview,
          projectType: WIZARD_CONTENT_INTERNAL_NAMES.FULL_STACK_APP
        }
      }, vscode).then((event:any)=>{
        let message = event.data;
        setFrontendFrameworks(
          parseFrameworksPayload(
            message.payload.frameworks,
            FRAMEWORK_TYPE.FRONTEND,
            message.payload.isPreview
          )
        );
        setBackendFrameworks(
          parseFrameworksPayload(
            message.payload.frameworks,
            FRAMEWORK_TYPE.BACKEND,
            message.payload.isPreview
          )
      );
      });
    }
  }

  const getDependencyInfoAndSetToStore = () =>{
    const { vscode } = props;
    // send messages to extension to check dependency info when this component loads
    vscode.postMessage({
      module: EXTENSION_MODULES.DEPENDENCYCHECKER,
      command: EXTENSION_COMMANDS.GET_DEPENDENCY_INFO,
      payload: {
        dependency: "node"
      }
    });
    vscode.postMessage({
      module: EXTENSION_MODULES.DEPENDENCYCHECKER,
      command: EXTENSION_COMMANDS.GET_DEPENDENCY_INFO,
      payload: {
        dependency: "python"
      }
    });
  }

  return (
    <div>
      {frontendOptions.map((option) => {
        return (
          <FrameworkCard framework={option} isFrontEnd={true}/>
        );
      })}
      {backendOptions.map((option) => {
        return (
          <p>Card!!</p>
        );
      })}
      <SelectFrontEndFramework />
      <SelectBackEndFramework />
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectFrameworks);