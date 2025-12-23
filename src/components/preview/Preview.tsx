import React from 'react';
import {MessageBar, MessageBarType, useTheme} from '@fluentui/react';
import { getDefaultFontFamily } from '~/services/fonts';
import { RuntimeType } from '~/services/config';
import { EvalEvent } from '~/services/api';
import EvalEventView from './EvalEventView';
import "../../state"
import {appState} from "~/state";
import {use} from "use-minimal-state";
export interface PreviewProps {
  lastError?: string | null;
  events?: EvalEvent[]
  runtime?: RuntimeType
}

const Preview: React.FC<PreviewProps> = ()=>{

  const {palette} = useTheme();
  const status = use(appState, "status")

  const styles =  {
    backgroundColor: palette?.neutralLight,
    color: palette?.neutralDark,
    fontFamily: getDefaultFontFamily(),
  }

  let content;

  if (status.lastError) {
    content = (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
          <b className="block mb-0.5">Error</b>
          <pre className='code'>
            {status.lastError}
          </pre>
        </MessageBar>
    )
  } else if (status.events) {

    content = status.events.map(({Data,  Kind}, k) => (
        <EvalEventView key={k}
                       data={Data}
                       kind={Kind}

        />
    ));

  } else {
    content = <span>Press &quot;Run&quot; to execute script.</span>;
  }

  return <div className="box-border overflow-auto flex-1" style={styles}>
    <div className="px-[15px] pb-[15px] text-[10pt]">
      {content}
    </div>
  </div>;

}


export default Preview;



