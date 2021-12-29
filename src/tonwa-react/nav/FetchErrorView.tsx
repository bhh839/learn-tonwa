import * as React from 'react';
import { FetchError, refetchApi } from 'tonwa-core';
import { Page } from '../components';

export interface FetchErrorProps extends FetchError {
    clearError: () => void
}

export default class FetchErrorView extends React.Component<FetchErrorProps, null> {
    private reApi = async () => {
        this.props.clearError();
        const { channel, url, options, resolve, reject } = this.props;
        await refetchApi(channel, url, options, resolve, reject);
    }
    private close = async () => {
        this.props.clearError();
    }
    render() {
        let { error, url } = this.props;
        let errContent: any;
        if (typeof error === 'object') {
            let err = [];
            for (let i in error) {
                err.push(<li key={i}><label>{i}</label><div style={{ wordWrap: "break-word" }}>{error[i]}</div></li>);
            }
            errContent = <ul>{err}</ul>;
        }
        else {
            errContent = <div>{error}</div>;
        }
        return <div className="tv-page">
            <article>
                <main className="va-error p-3">
                    <div>网络出现问题</div>
                    <div>点击重新访问</div>
                    <div style={{ wordWrap: "break-word" }}>url: {url}</div>
                    {errContent}
                    <div className="p-3 text-center">
                        <button className="btn btn-primary me-3" type='button' onClick={this.close}>关闭</button>
                        <button className="btn btn-outline-primary" type='button' onClick={this.reApi}>重试</button>
                    </div>
                </main>
            </article>
        </div>;
    }
}

export const SystemNotifyPage = ({ message }: { message: string }): JSX.Element => {
    return <Page header="系统提醒">
        <div className="px-3">{message}</div>
    </Page>;
}