import classNames from 'classnames/bind';
import Modal from 'react-modal';
import React, { useRef, useState } from 'react';
import Input from '../../../../components/Input/Input';
import styles from './Info.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCameraRetro, faRotate, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../context/AuthContext';
import axiosCilent from '../../../../api/axiosClient';
import UserItemSearchGroup from '../../ChatList/UserItemSearchGroup/UserItemSearchGroup';
import UserItemAdded from '../../ChatList/UserItemAdded/UserItemAdded';

import { io } from 'socket.io-client';
import apiConfig from '../../../../api/apiConfig';
const socket = io.connect(apiConfig.baseUrl, { transports: ['websocket'] });

const cx = classNames.bind(styles);

const customStyles = {
    content: {
        padding: '0',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

const Info = ({ params, img, nameInfo, conversation, outGroup }) => {
    const { user, dispatch } = useContext(AuthContext);
    Modal.setAppElement('#root');
    const navigate = useNavigate();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editName, setEditName] = useState(nameInfo);
    const [name, setName] = useState(nameInfo);
    const [nameSearch, setNameSearch] = useState('');
    const [adOutGroup, setAdOutGroup] = useState(false);
    const [avatar, setAvatar] = useState();
    const [modalIsOpenGroup, setModalIsOpenGroup] = useState(false);
    const [checked, setChecked] = useState([]);
    const [choose, setChoose] = useState();
    const [listUerAdded, setListUserAdded] = useState([]);
    const [listFriendInfo, setListFriendInfo] = useState([]);
    const [listFriendInfo2, setListFriendInfo2] = useState([]);
    const [listAddedInfo, setListAddInfo] = useState([]);
    const [listMemberInfo, setListMemberInfo] = useState([]);
    const refInput = useRef();

    const [isAddMem, setIsAddMem] = useState(false);
    const [isAuthority, setIsAuthority] = useState(false);
    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };
    const handleConfirm = async () => {
        const formData = new FormData();
        formData.append('img', avatar);
        formData.append('userID', user.id);
        formData.append('userfullName', user.fullName);
        formData.append('conversationId', conversation.id);
        formData.append('groupName', editName ? editName : nameInfo);
        try {
            await axiosCilent.put('/zola/conversation/avaGroup', formData);
            socket.emit('send-to-edit', {
                conversationID: conversation.id,
                members: conversation.members,
                nameGroup: editName ? editName : nameInfo,
            });
        } catch (err) {
            console.log(err);
        }
        setModalIsOpen(false);
    };

    const openModalGroup = () => {
        setChecked([]);
        setListUserAdded([]);
        setModalIsOpenGroup(true);
    };

    const closeModalGroup = () => {
        setModalIsOpenGroup(false);
        setIsAddMem(false);
        setIsAuthority(false);
        setIsAddMem(false);
        setIsAuthority(false);
        setChecked(false);
        setListUserAdded([]);
        setListAddInfo([]);
        setListFriendInfo([]);
        setAdOutGroup(false);
        setChoose('');
    };

    useEffect(() => {
        return () => {
            avatar && URL.revokeObjectURL(avatar.preview);
        };
    }, [avatar]);

    const handleReviewAvatar = (e) => {
        const file = e.target.files[0];
        file.preview = URL.createObjectURL(file);
        setAvatar(file);
    };

    const getUsersInfo = async (user, func) => {
        let listTemp = [];
        for (let i = 0; i < user.length; i++) {
            const res = await axiosCilent.get(`/zola/users/` + user[i]);
            listTemp.push(res);
        }
        func([...listTemp]);
    };
    useEffect(() => {
        setEditName(nameInfo);
    }, [nameInfo]);
    useEffect(() => {
        getUsersInfo(listUerAdded, setListAddInfo);
    }, [listUerAdded.length]);
    useEffect(() => {
        const list = conversation?.members.reduce((acc, cur) => {
            return user.friends.filter((f) => f.id !== cur);
        }, []);
        getUsersInfo(list, setListFriendInfo);
        setListFriendInfo2([...listFriendInfo]);
        console.log(123);
        conversation?.members && getUsersInfo(conversation?.members, setListMemberInfo);
    }, [conversation?.members.length]);
    useEffect(() => {
        const list = conversation?.members.reduce((acc, cur) => {
            return user.friends.filter((f) => f.id !== cur);
        }, []);
        getUsersInfo(list, setListFriendInfo);
        setListFriendInfo2([...listFriendInfo]);
    }, [modalIsOpenGroup]);

    const handleCheck = (id) => {
        setChecked((prev) => {
            const isChecked = checked.includes(id);
            if (isChecked) {
                setListUserAdded([...checked.filter((item) => item !== id)]);
                return checked.filter((item) => item !== id);
            } else {
                setListUserAdded([...prev, id]);
                return [...prev, id];
            }
        });
    };

    const [creator, setCreator] = useState({});

    const handleCheck2 = (id, fullName) => {
        setChoose(id);
        setCreator({ id, fullName });
    };

    const handleAddMemGroup = async (friend) => {
        try {
            await axiosCilent.put('/zola/conversation/addMem', {
                conversationId: conversation.id,
                user: user,
                listMember: listAddedInfo,
            });
            socket.emit('send-to-addMem', {
                idAdd: listUerAdded,
                conversationID: conversation.id,
            });

            closeModalGroup();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const list = [];
        if (nameSearch === '') {
            setListFriendInfo2([...listFriendInfo]);
        } else {
            listFriendInfo.forEach((e) => {
                if (e.fullName.toLowerCase().includes(nameSearch.toLowerCase())) {
                    list.push(e);
                }
            });
            setListFriendInfo2([...list]);
        }
    }, [nameSearch]);

    const handleAuthority = async () => {
        try {
            await axiosCilent.put('zola/conversation/grantPermission', {
                conversationId: conversation.id,
                creator: creator,
                user: user,
            });
            socket.emit('send-to-authorized', {
                members: conversation.members,
                conversationID: conversation.id,
            });
            closeModalGroup();
            if (outGroup === true) {
                const req = {
                    conversationId: conversation.id,
                    user: user,
                    members: conversation.members,
                };
                try {
                    await axiosCilent.put('/zola/conversation/outGroup', req);
                    navigate('/');
                    socket.emit('send-to-server', {
                        conversationID: conversation.id,
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        outGroup && setAdOutGroup(true);
    }, [outGroup]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <div className={cx('avatar')}>
                    <img src={img} alt="avatar" />
                </div>
                <div className={cx('info-name')}>
                    <span style={{ fontSize: 16 }}>{nameInfo}</span>
                    {conversation?.group && (
                        <div className={cx('edit')} onClick={openModal}>
                            <i className="bx bx-edit-alt"></i>
                        </div>
                    )}
                    <Modal isOpen={modalIsOpen} style={customStyles} onRequestClose={closeModal}>
                        <div className={cx('wrapper-modal')}>
                            <div className={cx('header-modal')}>
                                <span>?????i t??n v?? avatar group</span>
                            </div>
                            <div className={cx('body-modal')}>
                                <label for="update-avatar">
                                    <div className={cx('avatar')}>
                                        {avatar ? (
                                            <img src={avatar.preview} alt="vuong" />
                                        ) : (
                                            <img src={img} alt="phuc" />
                                        )}
                                        <div className={cx('iconcam-w')}>
                                            <FontAwesomeIcon
                                                icon={faCameraRetro}
                                                className={cx('icon-camera')}
                                                style={{ color: '#666', fontSize: '20' }}
                                            />
                                        </div>
                                    </div>
                                </label>
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    id="update-avatar"
                                    accept="image/*"
                                    name="avatar"
                                    onChange={handleReviewAvatar}
                                />
                                <div className={cx('input-wrapper')}>
                                    <input
                                        className={cx('input-edit-name')}
                                        type="text"
                                        ref={refInput}
                                        onChange={(e) => setEditName(e.target.value)}
                                        value={editName}
                                        placeholder={name}
                                        spellCheck={false}
                                    />
                                </div>
                            </div>
                            <div className={cx('footer-modal')}>
                                <button className={cx('btn-cancel')} onClick={closeModal}>
                                    H???y
                                </button>
                                <button className={cx('btn-conf')} onClick={handleConfirm}>
                                    X??c nh???n
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>

                <div className={cx('ruleAdmin')}>
                    {conversation?.group && (
                        <div
                            className={cx('addMem')}
                            onClick={() => {
                                setIsAddMem(true);
                                openModalGroup();
                            }}
                        >
                            <div className={cx('icon')}>
                                <FontAwesomeIcon icon={faUsers} />
                            </div>
                            <span>Th??m th??nh vi??n</span>
                        </div>
                    )}
                    <Modal
                        isOpen={modalIsOpenGroup || adOutGroup}
                        style={customStyles}
                        onRequestClose={closeModalGroup}
                    >
                        <div className={cx('wrapper-modal-group')}>
                            <div className={cx('header-modal-group')}>
                                {isAddMem ? (
                                    <span className={cx('title-group')}>Th??m th??nh vi??n v??o nh??m</span>
                                ) : (
                                    <span className={cx('title-group')}>C???p quy???n nh??m tr?????ng</span>
                                )}
                                <div className={cx('icon-exit-group')} onClick={closeModalGroup}>
                                    <i class="bx bx-x"></i>
                                </div>
                            </div>

                            <div className={cx('body-modal-group')}>
                                {isAddMem && (
                                    <div className={cx('add-member-group')}>
                                        <label>Th??m b???n v??o nh??m:</label>
                                        <Input
                                            type="text"
                                            placeholder="Nh???p t??n"
                                            icon={<i class="bx bxs-user-rectangle"></i>}
                                            data={setNameSearch}
                                        />
                                    </div>
                                )}

                                <div className={cx('list-friend-group')}>
                                    <div className={cx('wrapper-friends')}>
                                        {isAddMem ? (
                                            <>
                                                <span style={{ marginBottom: 20, display: 'block' }}>
                                                    Danh s??ch b???n b??
                                                </span>
                                                <ul className={cx('friends')}>
                                                    {listFriendInfo2.length > 0
                                                        ? listFriendInfo.map((user) => (
                                                              <li
                                                                  key={user.id}
                                                                  style={{ display: 'flex' }}
                                                                  className={cx('item-user-group')}
                                                              >
                                                                  <input
                                                                      type="checkbox"
                                                                      checked={checked.includes(user.id)}
                                                                      onChange={(e) => handleCheck(user.id)}
                                                                  />
                                                                  <UserItemSearchGroup
                                                                      name={user.fullName}
                                                                      ava={user.img}
                                                                      onClick={() => handleCheck(user.id)}
                                                                  />
                                                              </li>
                                                          ))
                                                        : nameSearch.length > 0 && (
                                                              <div style={{ marginLeft: '5px' }}>
                                                                  Kh??ng t??m th???y t??n ph?? h???p
                                                              </div>
                                                          )}
                                                </ul>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ marginBottom: 20, display: 'block' }}>
                                                    Danh s??ch th??nh vi??n nh??m
                                                </span>
                                                <ul className={cx('friends')}>
                                                    {listMemberInfo.map((user) => (
                                                        <li
                                                            key={user.id}
                                                            style={{ display: 'flex' }}
                                                            className={cx('item-user-group')}
                                                        >
                                                            <input
                                                                type="radio"
                                                                checked={choose === user.id}
                                                                onChange={(e) => handleCheck2(user.id, user.fullName)}
                                                            />
                                                            <UserItemSearchGroup
                                                                name={user.fullName}
                                                                ava={user.img}
                                                                onClick={() => handleCheck2(user.id, user.fullName)}
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                    {isAddMem && listUerAdded.length > 0 && (
                                        <div className={cx('list-user-added-w')}>
                                            <span
                                                style={{
                                                    display: 'block',
                                                    color: '#000',
                                                    fontSize: '14px',
                                                    width: '100%',
                                                    textAlign: 'center',
                                                    marginTop: '5px',
                                                }}
                                            >
                                                Th??m
                                            </span>
                                            <ul className={cx('list-user-added')}>
                                                {listAddedInfo.length > 0 &&
                                                    listAddedInfo.map((user) => (
                                                        <UserItemAdded name={user.fullName} ava={user.img} />
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={cx('footer-modal-group')}>
                                <div style={{ marginRight: 10 }}>
                                    <button className={cx('btn-cancel-group')} onClick={closeModalGroup}>
                                        H???y
                                    </button>
                                    {isAddMem ? (
                                        <button className={cx('btn-confirm-group')} onClick={handleAddMemGroup}>
                                            Th??m th??nh vi??n
                                        </button>
                                    ) : (
                                        <button className={cx('btn-confirm-group')} onClick={handleAuthority}>
                                            C???p quy???n
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Modal>
                    {conversation?.creator === user.id && conversation.members.length > 1 && (
                        <div
                            className={cx('grantMem')}
                            onClick={() => {
                                setIsAuthority(true);
                                openModalGroup();
                            }}
                        >
                            <div className={cx('icon')}>
                                <FontAwesomeIcon icon={faRotate} />
                            </div>
                            <span>???y quy???n</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Info;
