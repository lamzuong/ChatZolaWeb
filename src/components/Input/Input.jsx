import classNames from 'classnames/bind';
import { useEffect, useLayoutEffect, useState } from 'react';
import styles from './Input.module.scss';
import isEmail from '../../ulities/Validations';

const cx = classNames.bind(styles);

const Input = ({
    type = 'text',
    placeholder = 'xin nhap',
    icon = `<i className="bx bxs-envelope"></i>`,
    standard = {},
    validation = () => {},
    onEnter = () => {},
    data = () => {},
}) => {
    const [txtIpt, setTxtIpt] = useState('');
    const [init, setInit] = useState(false);

    useLayoutEffect(() => {
        setInit(!init);
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('form-control')}>
                {icon}
                <input
                    value={txtIpt}
                    type={type}
                    className={cx('ipt')}
                    placeholder={placeholder}
                    autoComplete="off"
                    onChange={(e) => {
                        setTxtIpt(e.target.value);
                        data(e.target.value);
                        setInit(false);
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            onEnter();
                        }
                    }}
                />
                <br />
            </div>
            {init || <span className={cx('warning')}>{validation(txtIpt, standard)}</span>}
        </div>
    );
};

export default Input;
