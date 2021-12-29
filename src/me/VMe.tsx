import { observer } from 'mobx-react';
import { Image, VPage, IconText, PropGrid, LMR, FA, Prop } from "tonwa";
import { CMe } from './CMe';
import { appConfig } from '../uq-app/appConfig';
import { VAbout } from './VAbout';
import { tonwa } from 'tonwa-core';

export class VMe extends VPage<CMe> {
    header() { return this.t('me') }

    content() {
        const { user } = tonwa;
        let aboutRows: Prop[] = [
            '',
            {
                type: 'component',
                component: <LMR className="w-100" onClick={this.about}
                    right={<FA className="align-self-center" name="angle-right" />}>
                    <IconText iconClass="text-info mr-2"
                        icon="smile-o"
                        text={<>{this.t('aboutTheApp')} <small>版本 {appConfig.version}</small></>} />
                </LMR>,
            },
        ];

        let rows: Prop[];
        if (user === undefined) {
            rows = aboutRows;
            rows.push(
                {
                    type: 'component',
                    component: <button className="btn btn-success w-100 my-2" onClick={() => tonwa.logout()}>
                        <FA name="sign-out" size="lg" /> {this.t('pleaseLogin')}
                    </button>
                },
            );
        }
        else {
            let logOutRows: Prop[] = [
            ];

            rows = [
                '',
                {
                    type: 'component',
                    component: <this.meInfo />
                },
            ]
            rows.push(...aboutRows, ...logOutRows);
        }
        return <PropGrid rows={[...rows]} values={{}} />;
    }

    private meInfo = observer(() => {
        let { user } = tonwa;
        if (user === undefined) return null;
        let { id, name, nick, icon } = user;
        return <LMR className="py-2 cursor-pointer w-100"
            left={<Image className="w-3c h-3c mr-3" src={icon || '.user-o'} />}
            right={<FA className="align-self-end" name="angle-right" />}
            onClick={this.controller.showEditMe}>
            <div>
                <div>{userSpan(name, nick)}</div>
                <div className="small"><span className="text-muted">ID:</span> {id > 10000 ? id : String(id + 10000).substr(1)}</div>
            </div>
        </LMR>;
    });

    private about = () => {
        this.openVPage(VAbout);
    }
}

function userSpan(name: string, nick: string): JSX.Element {
    return nick ?
        <><b>{nick} &nbsp; <small className="muted">{name}</small></b></>
        : <b>{name}</b>
}
