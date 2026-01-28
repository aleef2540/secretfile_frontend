import { useState } from 'react'
import logo from './assets/slogo.png';
import 'antd/dist/reset.css';
import { message, Row, Col, Layout, Table, Form, Input, Button, Modal, Space, Tag, Select, Upload, DatePicker, Popconfirm, Menu } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';
import {
    FileTextOutlined,
    SendOutlined,
} from '@ant-design/icons'; // เพิ่มไอคอน

import { ThaiDatePicker } from 'thaidatepicker-react';


import axios from 'axios';
import React, { useEffect } from "react";
import './App.css'

message.config({
    top: 100,
    duration: 3,
    maxCount: 3,
});

const menuStyle = {
    backgroundColor: '#0f172a', // สี modern
    padding: '0 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Inter, Poppins, Noto Sans Thai, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
};


const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { confirm } = Modal;


// ========== number&date function =============
const toThaiNumber = (input) => {
    return String(input).replace(/\d/g, d => '๐๑๒๓๔๕๖๗๘๙'[d]);
};
function thaiNumberToArabic(input) {
    const thaiDigits = '๐๑๒๓๔๕๖๗๘๙';
    const arabicDigits = '0123456789';

    return String(input).replace(/[๐-๙]/g, (match) => {
        return arabicDigits[thaiDigits.indexOf(match)];
    });
};
const formatThaiDateToText = (date) => {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    if (isNaN(date.getTime())) return '';

    const day = toThaiNumber(date.getDate());
    const monthIndex = date.getMonth();
    const year = toThaiNumber(date.getFullYear() + 543);

    const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    return `${day} ${thaiMonths[monthIndex]} ${year}`;
};
function parseThaiDateTextToISO(thaiDateText) {
    if (!thaiDateText) return null;

    const thaiMonths = {
        'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
        'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
        'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
    };

    // แปลงเลขไทยเป็นเลขอารบิก
    const thaiNumberToArabic = (str) => str.replace(/[๐-๙]/g, d => '0123456789'['๐๑๒๓๔๕๖๗๘๙'.indexOf(d)]);

    const [dayStr, monthText, yearStr] = thaiDateText.split(' ');
    const day = thaiNumberToArabic(dayStr).padStart(2, '0');
    const month = thaiMonths[monthText];
    const year = parseInt(thaiNumberToArabic(yearStr)) - 543;

    return `${year}-${month}-${day}`;
}
//==============================================
function App() {

    const getTodayInBuddhistFormat = () => {
        const today = new Date();
        const year = today.getFullYear(); // แปลงเป็น พ.ศ.
        const month = String(today.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มที่ 0
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear(); // แปลงเป็น พ.ศ.
        const month = String(today.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มที่ 0
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [showUserTable, setShowUserTable] = useState(false);
    const [inEditUserMode, setInEditUserMode] = useState(false);
    const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
    const [addUserForm] = Form.useForm();

    const [editingUser, setEditingUser] = useState(null);
    const [isEditUserModalVisible, setIsEditUserModalVisible] = useState(false);
    const [editUserForm] = Form.useForm();

    const [selectedDate, setSelectedDate] = useState(getToday());
    const [selectedDate1, setSelectedDate1] = useState(getToday());
    const [debug, setDebug] = useState("test");
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedThaiDate, setSelectedThaiDate] = useState(formatThaiDateToText(getTodayInBuddhistFormat()));
    const [selectedThaiDate1, setSelectedThaiDate1] = useState(formatThaiDateToText(getTodayInBuddhistFormat()));
    const [users, setUsers] = useState([]);
    const [secretfiles, setSecretfiles] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [currentFile, setCurrentFilecurrentFile] = useState(null);
    const [currentUser, setCurrentUsers] = useState(null);
    const [searchFilter, setSearchFilter] = useState("all");
    const [receiveSearchFilter, setReceiveSearchFilter] = useState("all");
    const [receiveSearchTerm, setReceiveSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const userRole = sessionStorage.getItem('role');
    const [form] = Form.useForm(); // Create form instance 'form' is assigned a value but never used.
    const [form1] = Form.useForm(); // Create form instance 'form' is assigned a value but never used.

    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isPasswordErrorModalVisible, setIsPasswordErrorModalVisible] = useState(false);
    const [loginUserInfo, setLoginUserInfo] = useState({ username: '', role: '' });
    const [isAuthenticated, setIsAuthenticated] = useState(false); // 👈 ใช้สำหรับล็อกอิน
    const [loginForm] = Form.useForm(); // 👈 ฟอร์ม Login
    const [currentPage, setCurrentPage] = useState("receive");

    const [receiveDocs, setReceiveDocs] = useState([]);
    const [isReceiveModalVisible, setIsReceiveModalVisible] = useState(false);
    const [currentReceive, setCurrentReceive] = useState(null);

    const [res, setRes] = useState(false);
    const [ok, setOk] = useState(false);
    const [del, setDel] = useState(false);

    const API_URL = "https://secretfile-backend.onrender.com";


    const getHeaderTitle = () => {
        if (showUserTable) return 'จัดการผู้ใช้';
        if (currentPage === 'send') return 'ทะเบียนส่ง (ทขล.๒)';
        if (currentPage === 'receive') return 'ทะเบียนรับ (ทขล.๑)';
        return '';
    };
    const handleDatePickerChange = (christDate, buddhistDate) => {
        //if (!christDate) return;
        const dateObj = new Date(christDate);
        if (isNaN(dateObj.getTime())) {
            console.error("ไม่สามารถแปลงเป็นวันที่ได้:", christDate);
            return;
        }
        const formatted = formatThaiDateToText(dateObj);
        setSelectedDate(christDate);
        setSelectedThaiDate(formatted);
    };

    const handleDatePickerChange1 = (christDate, buddhistDate) => {
        const dateObj = new Date(christDate);
        if (isNaN(dateObj.getTime())) {
            console.error("ไม่สามารถแปลงเป็นวันที่ได้:", christDate);
            return;
        }
        const formatted = formatThaiDateToText(dateObj);
        setSelectedDate1(christDate);
        setSelectedThaiDate1(formatted);
    };

    const showDeleteModal = (record) => {
        setDeleteId(record.id);
        setCurrentFilecurrentFile(record); // ✅ ใช้ currentFile แสดงใน Modal
        setDeleteModalVisible(true);
    };

    const showLogoutModal = () => {
        setLogoutModalVisible(true);
    };
    const handleConfirmLogout = () => {
        sessionStorage.clear();
        setShowUserTable(false);
        setCurrentPage("receive");
        setIsAuthenticated(false);
        setLogoutModalVisible(false);
        message.info('ออกจากระบบแล้ว');
    };
    const confirmDelete = async () => {
        if (deleteId) {
            await handleDeleteFiles(deleteId);
            setDeleteModalVisible(false);
            setDeleteId(null);
        }
    };
    const cancelDelete = () => {
        setDeleteModalVisible(false);
        setDeleteId(null);
        setCurrentFilecurrentFile(null);
    };
    const handleLogin = async (values) => {
        try {
            const response = await axios.post(`${API_URL}/api/logins`, values);
            const { username, role } = response.data;


            setLoginUserInfo({ username, role });
            setIsLoginModalVisible(true); // แสดง Modal แจ้งเตือน
        } catch (error) {
            if (error.response) {
                // Error จากฝั่งเซิร์ฟเวอร์ (เช่น 401, 500)
                console.log('Error Status:', error.response.status);
                console.log('Error Data:', error.response.data);

                // สมมุติว่า backend ส่ง error message เป็นข้อความใน data.message
                setErrorMessage(error.response.data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            } else if (error.request) {
                // Request ส่งไปแล้วแต่ไม่ได้ response
                setErrorMessage('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
            } else {
                // เกิดข้อผิดพลาดบางอย่างในฝั่ง client
                setErrorMessage(error.message || 'เกิดข้อผิดพลาดบางอย่าง');
            }

            setIsPasswordErrorModalVisible(true);
        }
    };
    const handleConfirmLogin = () => {
        setIsAuthenticated(true); // เข้าโปรแกรมจริง ๆ
        sessionStorage.setItem('authenticated', 'true');
        sessionStorage.setItem('username', loginUserInfo.username);
        sessionStorage.setItem('role', loginUserInfo.role);
        setIsLoginModalVisible(false);
    };
    const handleClosePasswordErrorModal = () => {
        setIsPasswordErrorModalVisible(false);
    };
    const handleCloseLogoutModal = () => {
        setLogoutModalVisible(false);
    };
    const fetchReceiveDocs = async () => {
        try {
            const resp = await axios.get('http://localhost:5278/api/receivedocs');
            setReceiveDocs(resp.data);
        } catch (err) {
            console.error('fetchReceiveDocs error', err);
        }
    };
    const fetchSecretfiles = async () => {
        const response = await axios.get('http://localhost:5278/api/secretfilessend');
        setSecretfiles(response.data);
    };
    const fetchUsers = async () => {
        const response = await axios.get('http://localhost:5278/api/users');
        setUsers(response.data);
    };
    const handleAddOrEditFiles = async (values) => {

        try {
            const formData = new FormData();
            formData.append("username", sessionStorage.getItem("username"));
            formData.append("send_number", thaiNumberToArabic(values.send_number));
            formData.append("secret_layer", values.secret_layer);
            formData.append("date", thaiNumberToArabic(selectedThaiDate));
            formData.append("from", values.from);
            formData.append("to", values.to);
            formData.append("subject", values.subject);
            formData.append("sign", values.sign);
            if (values.file && values.file.file) {
                formData.append("file", values.file.file); // 👈 ดึงไฟล์จาก Ant Design Upload
            }

            let response = null;

            if (currentFile) {
                response = await axios.put(`http://localhost:5278/api/secretfilessend/${currentFile.id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            } else {
                response = await axios.post('http://localhost:5278/api/secretfilessend', formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }

            if (response.config.method === 'post') {
                setErrorMessage("เพิ่มข้อมูลสำเร็จ");
            } else if (response.config.method === 'put') {
                setErrorMessage("แก้ไขข้อมูลสำเร็จ");
            }
            setOk(true);
            setIsModalVisible(false);
            setCurrentFilecurrentFile(null);
            form.resetFields(); // Reset the form fields
            fetchSecretfiles();

        } catch (error) {
            if (error.response) {
                // ❌ ได้ response จาก server (เช่น 400, 500)
                console.error("API Error:", error.response.data);
                console.error("Status:", error.response.status);

                setErrorMessage(error.response.data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');

                setRes(true);

            } else if (error.request) {
                // ❌ request ถูกส่ง แต่ไม่ได้รับ response (เช่น network error)
                setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
                setRes(true);

            } else {
                // ❌ ผิดพลาดอื่นๆ
                setErrorMessage("เกิดข้อผิดพลาดที่ไม่รู้จัก");
                setRes(true);
            }
        }


    };
    const handleDeleteFiles = async (id) => {
        if (currentPage === 'send') {
            await axios.delete(`http://localhost:5278/api/secretfilessend/${id}`, {
                headers: {
                    username: sessionStorage.getItem('username') // ✅ เพิ่มตรงนี้
                }
            });
            setDel(true);
            setCurrentFilecurrentFile(null);
            await fetchSecretfiles();
        } else if (currentPage === 'receive') {
            await axios.delete(`http://localhost:5278/api/receivedocs/${id}`, {
                headers: {
                    username: sessionStorage.getItem('username') // ✅ เพิ่มตรงนี้
                }
            });
            setDel(true);
            setCurrentReceive(null);
            await fetchReceiveDocs();
        }


    };
    const handleAddOrEditUser = async (values) => {
        console.log("Calling add user with", values);
        try {
            const formData = new FormData();
            formData.append("username", values.username);
            formData.append("password", values.password);
            formData.append("role", values.role);

            const url = currentUser
                ? `http://localhost:5278/api/users/${currentUser.id}`
                : 'http://localhost:5278/api/users';

            const method = currentUser ? 'put' : 'post';
            const response = await axios({
                method,
                url,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Response from server:", response);
            setIsAddUserModalVisible(false);
            setCurrentFilecurrentFile(null);
            setCurrentReceive(null);
            addUserForm.resetFields();
            fetchUsers();
            message.success(currentUser ? "แก้ไขผู้ใช้สำเร็จ" : "เพิ่มผู้ใช้สำเร็จ");
        } catch (error) {
            console.error("Error in add/edit user:", error.response || error);
            message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    };
    const handleDeleteUser = async (userId) => {
        try {
            await fetch(`http://localhost:5278/api/users/${userId}`, {
                method: 'DELETE',
            });

            // อัปเดตรายการผู้ใช้หลังลบ
            const updatedUsers = users.filter(u => u.id !== userId);
            setUsers(updatedUsers);

            message.success('ลบผู้ใช้เรียบร้อยแล้ว');
        } catch (error) {
            message.error('เกิดข้อผิดพลาดในการลบผู้ใช้');
            console.error(error);
        }
    };
    const handleAddOrEditReceive = async (values) => {



        try {

            const cleanedValues = {
                ...values,
                note: values.note?.trim() ? values.note.trim() : '-',
            };

            const formData = new FormData();
            formData.append("username", sessionStorage.getItem("username"));
            formData.append("receive_number", thaiNumberToArabic(cleanedValues.receive_number));
            formData.append("file_number", thaiNumberToArabic(cleanedValues.file_number));
            formData.append("secret_layer", cleanedValues.secret_layer);
            formData.append("date", thaiNumberToArabic(selectedThaiDate));
            formData.append("from", cleanedValues.from);
            formData.append("to", cleanedValues.to);
            formData.append("subject", cleanedValues.subject);
            formData.append("sign", cleanedValues.sign);
            formData.append("date1", thaiNumberToArabic(selectedThaiDate1));
            formData.append("note", cleanedValues.note);
            if (cleanedValues.file && cleanedValues.file.file) {
                formData.append("file", cleanedValues.file.file);
            }

            let response = null;

            if (currentReceive) {
                response = await axios.put(`http://localhost:5278/api/receivedocs/${currentReceive.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } else {
                response = await axios.post('http://localhost:5278/api/receivedocs', formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            if (response.config.method === 'post') {
                setErrorMessage("เพิ่มข้อมูลสำเร็จ");
            } else if (response.config.method === 'put') {
                setErrorMessage("แก้ไขข้อมูลสำเร็จ");
            }
            setOk(true);
            setIsReceiveModalVisible(false);
            setCurrentFilecurrentFile(null);
            setCurrentReceive(null);
            form1.resetFields();
            fetchReceiveDocs();
            message.success(currentReceive ? "แก้ไขเอกสารรับสำเร็จ" : "เพิ่มเอกสารรับสำเร็จ");

        } catch (error) {
            if (error.response) {
                // ❌ ได้ response จาก server (เช่น 400, 500)
                console.error("API Error:", error.response.data);
                console.error("Status:", error.response.status);

                setErrorMessage(error.response.data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');

                setRes(true);

            } else if (error.request) {
                // ❌ request ถูกส่ง แต่ไม่ได้รับ response (เช่น network error)
                setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
                setRes(true);

            } else {
                // ❌ ผิดพลาดอื่นๆ
                setErrorMessage("เกิดข้อผิดพลาดที่ไม่รู้จัก");
                setRes(true);
            }
        }
    };
    useEffect(() => {

        const isAuth = sessionStorage.getItem('authenticated');
        if (isAuth === 'true') {
            setIsAuthenticated(true);
        }
        fetchUsers();
        fetchSecretfiles();
        fetchReceiveDocs();
    }, []);
    useEffect(() => {
        if (currentPage === 'receive') {
            fetchReceiveDocs();
        }
    }, [currentPage]);
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Enter' && isLoginModalVisible) {
                event.preventDefault();
                handleConfirmLogin();
            }
        }

        if (isLoginModalVisible) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isLoginModalVisible]);
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Enter' && isPasswordErrorModalVisible) {
                event.preventDefault();
                handleClosePasswordErrorModal();
            }
        }

        if (isPasswordErrorModalVisible) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPasswordErrorModalVisible]);

    const openEditModal = (record) => {
        if (currentPage === 'send') {
            setCurrentFilecurrentFile(record);
            const iso = parseThaiDateTextToISO(record.date) || record.date;
            const formatted = formatThaiDateToText(iso);
            setSelectedDate(iso);
            setSelectedThaiDate(formatted);
            form.setFieldsValue({ date: formatted });
            // Set form fields
            form.setFieldsValue({
                send_number: record.send_number,
                secret_layer: record.secret_layer,
                from: record.from,
                to: record.to,
                subject: record.subject,
                sign: record.sign,
            });

            setIsModalVisible(true);
        } else if (currentPage === 'receive') {
            setCurrentReceive(record);
            const iso = parseThaiDateTextToISO(record.date) || record.date;
            const iso1 = parseThaiDateTextToISO(record.date1) || record.date1;
            const formatted = formatThaiDateToText(iso);
            const formatted1 = formatThaiDateToText(iso1);
            setSelectedDate(iso);
            setSelectedThaiDate(formatted);
            setSelectedDate1(iso1);
            setSelectedThaiDate1(formatted1);
            form1.setFieldsValue({ date: formatted });
            form1.setFieldsValue({ date1: formatted1 });
            // Set form fields
            form1.setFieldsValue({
                receive_number: record.receive_number,
                file_number: record.file_number,
                secret_layer: record.secret_layer,
                from: record.from,
                to: record.to,
                subject: record.subject,
                sign: record.sign,
                note: record.note,
            });
            setIsReceiveModalVisible(true);
        }

    };
    const filteredSecretfiles = secretfiles.filter(file => {
        const term = searchTerm.toLowerCase();
        const iso = thaiNumberToArabic(term);

        // แปลงคำค้นเป็นค่าชั้นความลับ
        let levelMatch = null;
        if (term.includes("ลับที่สุด")) {
            levelMatch = 3;
        } else if (term.includes("ลับมาก")) {
            levelMatch = 2;
        } else if (term.includes("ลับ")) {
            levelMatch = 1;
        } else if (term.includes("ทั้งหมด")) {
            levelMatch = 0;
        }

        switch (searchFilter) {
            case 'send_number':
                return file.send_number?.toString().includes(iso);
            case 'secret_layer':
                return searchTerm === '' || Number(file.secret_layer) === Number(searchTerm);
            case 'date':
                return file.date?.toLowerCase().includes(term);
            case 'from':
                return file.from?.toLowerCase().includes(term);
            case 'to':
                return file.to?.toLowerCase().includes(term);
            case 'subject':
                return file.subject?.toLowerCase().includes(term);
            case 'sign':
                return file.sign?.toLowerCase().includes(term);
            case 'all':
            default:
                return (
                    file.subject?.toLowerCase().includes(term) ||
                    file.from?.toLowerCase().includes(term) ||
                    file.to?.toLowerCase().includes(term) ||
                    file.date?.toLowerCase().includes(term) ||
                    file.sign?.toLowerCase().includes(term) ||
                    file.send_number?.toString().includes(term) ||
                    (levelMatch !== null && Number(file.secret_layer) === levelMatch)
                );
        }

    });
    const filteredReceiveFiles = receiveDocs.filter(file => {
        const term = receiveSearchTerm.toLowerCase();
        const iso = thaiNumberToArabic(term);

        // แปลงคำค้นเป็นค่าชั้นความลับ
        let levelMatch = null;
        if (term.includes("ลับที่สุด")) {
            levelMatch = 3;
        } else if (term.includes("ลับมาก")) {
            levelMatch = 2;
        } else if (term.includes("ลับ")) {
            levelMatch = 1;
        } else if (term.includes("ทั้งหมด")) {
            levelMatch = 0;
        }

        switch (receiveSearchFilter) {
            case 'receive_number':
                return file.receive_number?.toString().includes(iso);
            case 'file_number':
                return file.file_number?.toLowerCase().includes(iso);
            case 'secret_layer':
                return receiveSearchTerm === '' || Number(file.secret_layer) === Number(receiveSearchTerm);
            case 'date':
                return file.date?.toLowerCase().includes(iso);
            case 'from':
                return file.from?.toLowerCase().includes(term);
            case 'to':
                return file.to?.toLowerCase().includes(term);
            case 'subject':
                return file.subject?.toLowerCase().includes(term);
            case 'sign':
                return file.sign?.toLowerCase().includes(term);
            case 'date1':
                return file.date1?.toLowerCase().includes(iso);
            case 'note':
                return file.note?.toLowerCase().includes(term);
            case 'all':
            default:
                return (

                    file.receive_number?.toString().includes(iso) ||
                    file.file_number?.toLowerCase().includes(iso) ||
                    file.date?.toLowerCase().includes(iso) ||
                    file.from?.toLowerCase().includes(term) ||
                    file.to?.toLowerCase().includes(term) ||
                    file.subject?.toLowerCase().includes(term) ||
                    file.sign?.toLowerCase().includes(term) ||
                    file.date1?.toLowerCase().includes(iso) ||
                    file.note?.toString().includes(term) ||
                    (levelMatch !== null && Number(file.secret_layer) === levelMatch)

                );
        }

    });
    const handleDownload = (fileName) => {
        let fileUrl = '';
        if (currentPage === 'send') {

            fileUrl = `http://localhost:5278/uploads/send/${fileName}`;
        } else if (currentPage === 'receive') {
            fileUrl = `http://localhost:5278/uploads/receive/${fileName}`;
        }

        fetch(fileUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(() => alert('Download failed'));
    };
    const columns = [
        { title: 'เลขที่ส่งหนังสือ', dataIndex: 'send_number', key: 'send_number', align: 'center', width: 100, render: (value) => toThaiNumber(value) },
        {
            title: 'ชั้นความลับ', dataIndex: 'secret_layer', key: 'secret_layer', align: 'center', width: 110,
            render: (value) => {
                const level = Number(value); // เผื่อค่ามาเป็น string

                switch (level) {
                    case 1:
                        return <Tag color="blue">ลับ</Tag>;
                    case 2:
                        return <Tag color="red">ลับมาก</Tag>;
                    case 3:
                        return <Tag color="gold">ลับที่สุด</Tag>;
                    default:
                        return <Tag color="default">ไม่ระบุ</Tag>;
                }
            }
        },
        {
            title: 'ลงวันที่',
            dataIndex: 'date',
            key: 'date',
            align: 'center', width: 100,
            render: (value) => toThaiNumber(value)

        },
        { title: 'จาก', dataIndex: 'from', key: 'from', align: 'center', width: 100 },
        { title: 'ถึง', dataIndex: 'to', key: 'to', align: 'center', width: 100 },
        {
            title: 'เรื่อง', dataIndex: 'subject', key: 'subject', align: 'center', width: 600, render: (text) => (
                <div style={{
                    overflowX: 'auto',
                    whiteSpace: 'nowrap'
                }}>
                    {text}
                </div>
            )
        },

        { title: 'ลงชื่อ', dataIndex: 'sign', key: 'sign', align: 'center', width: 100 },
        {
            title: 'ไฟล์',
            dataIndex: 'file',
            key: 'file',
            align: 'center',
            width: 100,
            render: (fileName) => {
                if (!fileName) return '-';

                const fileUrl = `http://localhost:5278/uploads/send/${fileName}`;

                return (
                    <Space size="middle">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" title="เปิดไฟล์ PDF">
                            <FilePdfOutlined style={{ fontSize: '20px', color: '#E74C3C' }} />
                        </a>
                        <Button
                            icon={<DownloadOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                            onClick={() => handleDownload(fileName)}
                            title="ดาวน์โหลดไฟล์"
                            type="text"
                        />
                    </Space>

                );
            }
        },

        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 30,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            //setCurrentFilecurrentFile(record); 
                            //form.setFieldsValue(record); 
                            //setIsModalVisible(true); 
                            openEditModal(record);
                        }}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => showDeleteModal(record)}
                    />
                </Space>
            ),
        },
    ];
    const userColumns = [
        { title: 'Username', dataIndex: 'username', key: 'username' },
        { title: 'Password', dataIndex: 'password', key: 'password' },
        { title: 'Role', dataIndex: 'role', key: 'role' },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setCurrentUsers(record); // เซต user ที่จะแก้ไข
                            addUserForm.setFieldsValue({
                                username: record.username,
                                role: record.role,
                                password: '', // ปล่อยว่างไว้
                            });
                            setIsAddUserModalVisible(true); // เปิด modal
                        }}
                    />
                    <Popconfirm
                        title="คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="ลบ"
                        cancelText="ยกเลิก"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        },
    ];
    const receiveColumns = [
        { title: 'เลขที่รับหนังสือ', dataIndex: 'receive_number', key: 'receive_number', align: 'center', render: (value) => toThaiNumber(value) },
        { title: 'เลขที่หนังสือ', dataIndex: 'file_number', key: 'file_number', align: 'center', render: (value) => toThaiNumber(value) },
        {
            title: 'ชั้นความลับ', dataIndex: 'secret_layer', key: 'secret_layer', align: 'center',
            render: (value) => {
                const level = Number(value);
                switch (level) {
                    case 1: return <Tag color="blue">ลับ</Tag>;
                    case 2: return <Tag color="red">ลับมาก</Tag>;
                    case 3: return <Tag color="gold">ลับที่สุด</Tag>;
                    default: return <Tag color="default">ไม่ระบุ</Tag>;
                }
            }
        },
        { title: 'วัน/เดือน/ปี', dataIndex: 'date', key: 'date', align: 'center', render: (value) => toThaiNumber(value) },
        { title: 'จาก', dataIndex: 'from', key: 'from', align: 'center' },
        { title: 'ถึง', dataIndex: 'to', key: 'to', align: 'center' },
        { title: 'เรื่อง', dataIndex: 'subject', key: 'subject', align: 'center' },
        { title: 'ลงชื่อ', dataIndex: 'sign', key: 'sign', align: 'center' },
        { title: 'วันที่รับ', dataIndex: 'date1', key: 'date1', align: 'center', render: (value) => toThaiNumber(value) },
        { title: 'หมายเหตุ', dataIndex: 'note', key: 'note', align: 'center' },
        {
            title: 'ไฟล์', dataIndex: 'file', key: 'file', align: 'center',
            render: (fileName) => {
                if (!fileName) return '-';
                const fileUrl = `http://localhost:5278/uploads/receive/${fileName}`;
                return (
                    <Space size="middle">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <FilePdfOutlined style={{ fontSize: '20px', color: '#E74C3C' }} />
                        </a>
                        <Button
                            icon={<DownloadOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                            onClick={() => handleDownload(fileName)}
                            type="text"
                        />
                    </Space>
                );
            }
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => {
                        openEditModal(record);
                    }} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => {
                        showDeleteModal(record);
                    }} />
                </Space>
            )
        }
    ];
    if (!isAuthenticated) {
        return (
            <>
                {/* หน้าจอ Login */}
                <Layout style={{ minHeight: '100vh', display: 'flex', paddingTop: '30px', alignItems: 'center' }}>
                    {/* ... โค้ด Login form ตามเดิม */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 24,
                    }}>
                        <img src={logo} alt="Login Logo" style={{ height: 250 }} />
                        <div style={{
                            background: '#fff',
                            padding: 30,
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            minWidth: 300,
                            width: '100%',
                            maxWidth: 400
                        }}>
                            <h2 style={{ textAlign: 'center' }}>Login</h2>
                            <Form
                                form={loginForm}
                                onFinish={handleLogin}
                                layout="vertical"
                            >
                                <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" block>
                                        Login
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </div>
                </Layout>

                {/* Modal แจ้งเตือนหลัง Login สำเร็จ */}
                <Modal
                    title="Login สำเร็จ"
                    open={isLoginModalVisible}
                    onOk={handleConfirmLogin}
                    footer={[
                        <Button key="ok" type="primary" onClick={handleConfirmLogin}>
                            ตกลง
                        </Button>
                    ]}
                    closable={false}
                    maskClosable={false}
                >

                    <p>ยินดีต้อนรับ {loginUserInfo.username}</p>
                </Modal>

                {/* Modal รหัสผ่านไม่ถูกต้อง */}
                <Modal
                    title="ข้อผิดพลาด"
                    open={isPasswordErrorModalVisible}
                    onOk={handleClosePasswordErrorModal}
                    footer={[
                        <Button key="ok" type="primary" onClick={handleClosePasswordErrorModal}>
                            ตกลง
                        </Button>
                    ]}
                    closable={false}
                    maskClosable={false}
                >
                    <p>{errorMessage}</p>

                </Modal>


            </>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                backgroundColor: '#001529',
                display: 'flex',
                justifyContent: 'center', // จัดแนวนอนตรงกลาง
                alignItems: 'center',     // จัดแนวตั้งตรงกลาง
                position: 'relative',
                padding: '0 20px',
                alignItems: 'center',
                height: '70px',
                color: '#fff',
                fontSize: '20px',
                fontWeight: 'bold'
            }}>

                {showUserTable ? (
                    <>

                    </>
                ) : (<>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[currentPage]}
                        onClick={(e) => {
                            setCurrentFilecurrentFile(null);
                            setCurrentReceive(null);
                            setCurrentPage(e.key);  // คำสั่งที่ 1
                            // เพิ่มคำสั่งอื่นๆ ได้ที่นี่
                        }}
                        theme="dark"
                        style={{
                            backgroundColor: '#001529',
                            position: 'absolute',
                            left: 20,
                        }}
                    >
                        <Menu.Item key="receive"
                            style={{
                                borderRadius: '10px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 20px',
                            }}>ทะเบียนรับ</Menu.Item>
                        <Menu.Item key="send"
                            style={{
                                borderRadius: '10px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 20px',
                            }}>ทะเบียนส่ง</Menu.Item>

                    </Menu>
                </>)}

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px', // ระยะห่างระหว่างโลโก้กับข้อความ
                    fontSize: '20px',
                    fontWeight: 'bold',
                }}>
                    <img src={logo} alt="Logo Left" style={{ height: 50 }} />
                    {getHeaderTitle()}
                    <img src={logo} alt="Logo Right" style={{ height: 50 }} />
                </div>

                <Button
                    style={{ position: 'absolute', right: 20, top: 16 }}
                    onClick={() => {
                        showLogoutModal();

                    }}
                >
                    Logout
                </Button>
                {userRole === 'admin' && (

                    <Button
                        style={{ position: 'absolute', right: 100, top: 16 }}
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setShowUserTable(!showUserTable);
                            setInEditUserMode(!inEditUserMode);
                        }}
                    >
                        {inEditUserMode ? 'Edit File' : 'Edit User'}
                    </Button>
                )}


            </Header>

            <Content style={{
                padding: '50 px',
                paddingTop: '10px',
            }}>

                {showUserTable ? (
                    <>
                        <Space style={{ marginBottom: '20px', marginLeft: '10px', float: 'left' }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddUserModalVisible(true)}>
                                เพิ่มผู้ใช้งาน
                            </Button>
                        </Space>
                        <Table
                            columns={userColumns}
                            dataSource={users}
                            rowKey="id"
                        />


                    </>
                ) : (<>
                    {currentPage === 'send' ? (

                        <>
                            <Space style={{ marginBottom: '20px', marginLeft: '10px', float: 'left' }}>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                                    เพิ่มเอกสารส่ง
                                </Button>
                            </Space>
                            <Space style={{ marginBottom: '20px', marginRight: '10px', float: 'right' }}>
                                <Select
                                    defaultValue="all"
                                    value={searchFilter}
                                    style={{ width: 150 }}
                                    onChange={(value) => {
                                        setSearchFilter(value); setSearchTerm('')
                                    }}
                                >
                                    <Select.Option value="all">ทั้งหมด</Select.Option>
                                    <Select.Option value="send_number">เลขที่ส่งหนังสือ</Select.Option>
                                    <Select.Option value="secret_layer">ชั้นความลับ</Select.Option>
                                    <Select.Option value="date">ลงวันที่</Select.Option>
                                    <Select.Option value="from">จาก</Select.Option>
                                    <Select.Option value="to">ถึง</Select.Option>
                                    <Select.Option value="subject">เรื่อง</Select.Option>
                                    <Select.Option value="sign">ลงชื่อ</Select.Option>
                                </Select>

                                {searchFilter === 'secret_layer' ? (
                                    <Select
                                        placeholder="เลือกชั้นความลับ"
                                        value={searchTerm || undefined}
                                        style={{ width: 300 }}
                                        onChange={(value) => { setSearchTerm(value) }}
                                    >
                                        <Select.Option value="">ทั้งหมด</Select.Option>
                                        <Select.Option value="1">ลับ</Select.Option>
                                        <Select.Option value="2">ลับมาก</Select.Option>
                                        <Select.Option value="3">ลับที่สุด</Select.Option>
                                    </Select>
                                ) : (
                                    <Search
                                        placeholder="ค้นหา"
                                        onSearch={value => setSearchTerm(value)}
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{ width: 300 }}
                                    />
                                )}
                            </Space>
                            <div style={{ clear: 'both' }} />
                            <Table dataSource={filteredSecretfiles.sort((a, b) => a.send_number - b.send_number)} columns={columns} rowKey="id" />
                        </>
                    )
                        : (
                            <>
                                {/* ทะเบียนรับ */}
                                <Space style={{ marginBottom: '20px', marginLeft: '10px', float: 'left' }}>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsReceiveModalVisible(true)}>
                                        เพิ่มเอกสารรับ
                                    </Button>
                                </Space>
                                <Space style={{ marginBottom: '20px', marginRight: '10px', float: 'right' }}>
                                    {/* ค้นหา / filter สำหรับ receive */}
                                    <Select
                                        defaultValue="all"
                                        value={receiveSearchFilter}
                                        style={{ width: 150 }}
                                        onChange={(value) => { setReceiveSearchFilter(value); setReceiveSearchTerm(''); }}
                                    >
                                        <Select.Option value="all">ทั้งหมด</Select.Option>
                                        <Select.Option value="receive_number">เลขที่รับหนังสือ</Select.Option>
                                        <Select.Option value="file_number">เลขที่หนังสือ</Select.Option>
                                        <Select.Option value="secret_layer">ชั้นความลับ</Select.Option>
                                        <Select.Option value="date">วัน/เดือน/ปี</Select.Option>
                                        <Select.Option value="from">จาก</Select.Option>
                                        <Select.Option value="to">ถึง</Select.Option>
                                        <Select.Option value="subject">เรื่อง</Select.Option>
                                        <Select.Option value="sign">ลงชื่อ</Select.Option>
                                        <Select.Option value="date1">วันที่รับ</Select.Option>
                                        <Select.Option value="note">หมายเหตุ</Select.Option>
                                    </Select>

                                    {receiveSearchFilter === 'secret_layer' ? (
                                        <Select
                                            placeholder="เลือกชั้นความลับ"
                                            value={receiveSearchTerm || undefined}
                                            style={{ width: 300 }}
                                            onChange={(value) => setReceiveSearchTerm(value)}
                                        >
                                            <Select.Option value="">ทั้งหมด</Select.Option>
                                            <Select.Option value="1">ลับ</Select.Option>
                                            <Select.Option value="2">ลับมาก</Select.Option>
                                            <Select.Option value="3">ลับที่สุด</Select.Option>
                                        </Select>
                                    ) : (
                                        <Search
                                            placeholder="ค้นหา"
                                            onSearch={(value) => setReceiveSearchTerm(value)}
                                            value={receiveSearchTerm}
                                            onChange={e => setReceiveSearchTerm(e.target.value)}
                                            style={{ width: 300 }}
                                        />
                                    )}
                                </Space>
                                <div style={{ clear: 'both' }} />
                                <Table
                                    dataSource={filteredReceiveFiles.sort((a, b) => a.receive_number - b.receive_number)}
                                    columns={receiveColumns}
                                    rowKey="id"
                                />
                                {/* คุณสามารถเพิ่มฟอร์ม/ตารางรับเอกสารที่นี่ได้ */}
                            </>
                        )}

                </>)}




                <Modal
                    title={currentReceive ? 'แก้ไขเอกสารรับ' : 'เพิ่มเอกสารรับ'}
                    visible={isReceiveModalVisible}
                    onCancel={() => { setIsReceiveModalVisible(false); setCurrentReceive(null); form1.resetFields(); }}
                    footer={null}
                    width={700}
                >

                    <Form
                        form={form1}
                        //initialValues={currentFile}
                        onFinish={handleAddOrEditReceive}
                        layout="vertical">

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="receive_number" label="เลขที่รับหนังสือ"
                                    rules={[
                                        { required: true, message: 'กรุณากรอกเลขที่รับ' },
                                        { pattern: /^[0-9]+$/, message: 'กรุณากรอกเฉพาะตัวเลข' },
                                    ]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="file_number" label="เลขที่หนังสือ" rules={[{ required: true, message: 'กรุณากรอกเลขที่หนังสือ' }]}>
                                    <Input />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="secret_layer" label="ชั้นความลับ" rules={[{ required: true, message: 'กรุณาระบุชั้นความลับ' }]}>
                                    <Select placeholder="เลือกชั้นความลับ">
                                        <Select.Option value={1}>ลับ</Select.Option>
                                        <Select.Option value={2}>ลับมาก</Select.Option>
                                        <Select.Option value={3}>ลับที่สุด</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <label style={{ display: 'block', marginBottom: 8 }}>ลงวันที่</label>
                                <ThaiDatePicker
                                    value={selectedDate}
                                    onChange={handleDatePickerChange}
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 4,
                                        padding: '4px 11px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </Col>
                            <Col span={8}>
                                <Form.Item name="from" label="จาก" rules={[{ required: true, message: 'กรุณากรอกหน่วยงานผู้ส่ง' }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="to" label="ถึง" rules={[{ required: true, message: 'กรุณากรอกหน่วยงานผู้รับ' }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="subject" label="เรื่อง" rules={[{ required: true, message: 'กรุณากรอกชื่อเรื่อง' }]}>
                            <Input />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="sign" label="ลงชื่อ" rules={[{ required: true, message: 'กรุณาลงชื่อ' }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <label style={{ display: 'block', marginBottom: 8 }}>วันที่รับ</label>
                                <ThaiDatePicker
                                    value={selectedDate1}
                                    onChange={handleDatePickerChange1}
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 4,
                                        padding: '4px 11px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </Col>

                            <Col span={8}>
                                <Form.Item name="note" label="หมายเหตุ" >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>


                        <Form.Item name="file" label="แนบไฟล์" valuePropName="file">
                            <Upload
                                beforeUpload={() => false} // ป้องกัน auto upload
                                maxCount={1}
                            >
                                <Button>เลือกไฟล์</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button type='primary' htmlType='submit'>
                                บันทึก
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={currentFile ? 'แก้ไขเอกสารส่ง' : 'เพิ่มเอกสารส่ง'}
                    visible={isModalVisible}
                    onCancel={() => { setIsModalVisible(false); setCurrentFilecurrentFile(null); form.resetFields(); }}
                    footer={null}
                    width={700}
                >

                    <Form
                        form={form}
                        initialValues={{
                            from: 'กรม ปพ.อย.',
                        }}
                        onFinish={handleAddOrEditFiles}
                        layout="vertical">

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="send_number" label="เลขที่ส่งหนังสือ"
                                    rules={[
                                        { required: true, message: 'กรุณากรอกเลขที่ส่ง' },
                                        { pattern: /^[0-9]+$/, message: 'กรุณากรอกเฉพาะตัวเลข' },
                                    ]}>
                                    <Input />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="secret_layer" label="ชั้นความลับ" rules={[{ required: true, message: 'กรุณาระบุชั้นความลับ' }]}>
                                    <Select placeholder="เลือกชั้นความลับ">
                                        <Select.Option value={1}>ลับ</Select.Option>
                                        <Select.Option value={2}>ลับมาก</Select.Option>
                                        <Select.Option value={3}>ลับที่สุด</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <label style={{ display: 'block', marginBottom: 8 }}>ลงวันที่</label>
                                <ThaiDatePicker
                                    value={selectedDate}
                                    onChange={handleDatePickerChange}
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 4,
                                        padding: '4px 11px',
                                        boxSizing: 'border-box'
                                    }}
                                />

                            </Col>

                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="from" label="จาก" rules={[{ required: true }]}>
                                    <Input readOnly />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="to" label="ถึง" rules={[{ required: true, message: 'กรุณากรอกหน่วยงานผู้รับ' }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="subject" label="เรื่อง" rules={[{ required: true, message: 'กรุณากรอกชื่อเรื่อง' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="sign" label="ลงชื่อ" rules={[{ required: true, message: 'กรุณาลงชื่อ' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item name="file" label="แนบไฟล์" valuePropName="file">
                            <Upload
                                beforeUpload={() => false} // ป้องกัน auto upload
                                maxCount={1}
                            >
                                <Button>เลือกไฟล์</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button type='primary' htmlType='submit'>
                                บันทึก
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={currentUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}
                    open={isAddUserModalVisible}
                    onCancel={() => {
                        setIsAddUserModalVisible(false);
                        setCurrentUsers(null);
                        addUserForm.resetFields();
                    }}
                    footer={null}
                    destroyOnClose
                >
                    <Form
                        form={addUserForm}
                        layout="vertical"
                        onFinish={handleAddOrEditUser}
                    >
                        <Form.Item
                            name="username"
                            label="ชื่อผู้ใช้"
                            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
                        >
                            <Input />

                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="รหัสผ่าน"
                            rules={[
                                {
                                    required: !currentUser, // ถ้าเพิ่ม user ใหม่ ต้องกรอกรหัสผ่าน, ถ้าแก้ไขไม่บังคับ
                                    message: 'กรุณากรอกรหัสผ่าน'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            label="สิทธิ์การใช้งาน"
                            rules={[{ required: true, message: 'กรุณาเลือกสิทธิ์' }]}
                        >
                            <Select placeholder="เลือกสิทธิ์">
                                <Select.Option value="admin">Admin</Select.Option>
                                <Select.Option value="user">User</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                {currentUser ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

            </Content>
            <Footer style={{ textAlign: 'center', backgroundColor: '#001529', color: '#fff', position: 'sticky', bottom: 0 }}>
                {new Date().getFullYear()}
            </Footer>


            {currentPage === 'send' ? (
                <>
                    <Modal
                        title="ยืนยันการลบ"
                        visible={deleteModalVisible}
                        onOk={confirmDelete}
                        onCancel={cancelDelete}
                        okText="ลบ"
                        okButtonProps={{ danger: true }}
                        cancelText="ยกเลิก"
                    >
                        {currentFile ? (
                            <div>
                                <p>คุณต้องการลบเอกสารนี้หรือไม่?</p>
                                <p><strong>เลขที่ส่ง:</strong> {toThaiNumber(currentFile.send_number)}</p>
                                <p>
                                    <strong>ชั้นความลับ:</strong>&nbsp;
                                    {
                                        (() => {
                                            const level = Number(currentFile.secret_layer);
                                            switch (level) {
                                                case 1:
                                                    return <Tag color="blue">ลับ</Tag>;
                                                case 2:
                                                    return <Tag color="red">ลับมาก</Tag>;
                                                case 3:
                                                    return <Tag color="gold">ลับที่สุด</Tag>;
                                                default:
                                                    return <Tag color="default">ไม่ระบุ</Tag>;
                                            }
                                        })()
                                    }
                                </p>
                                <p><strong>วันที่:</strong> {currentFile.date}</p>
                                <p><strong>จาก:</strong> {currentFile.from}</p>
                                <p><strong>ถึง:</strong> {currentFile.to}</p>
                                <p><strong>เรื่อง:</strong> {currentFile.subject}</p>
                                <p><strong>ลงชื่อ:</strong> {currentFile.sign}</p>
                            </div>
                        ) : (
                            <p>กำลังโหลดข้อมูล...</p>
                        )}
                    </Modal>
                </>

            ) : (
                <>
                    <Modal
                        title="ยืนยันการลบ"
                        visible={deleteModalVisible}
                        onOk={confirmDelete}
                        onCancel={cancelDelete}
                        okText="ลบ"
                        okButtonProps={{ danger: true }}
                        cancelText="ยกเลิก"
                    >
                        {currentFile ? (
                            <div>
                                <p>คุณต้องการลบเอกสารนี้หรือไม่?</p>
                                <p><strong>เลขที่รับ:</strong> {toThaiNumber(currentFile.receive_number)}</p>
                                <p><strong>เลขที่หนังสือ:</strong> {toThaiNumber(currentFile.file_number)}</p>
                                <p>
                                    <strong>ชั้นความลับ:</strong>&nbsp;
                                    {
                                        (() => {
                                            const level = Number(currentFile.secret_layer);
                                            switch (level) {
                                                case 1:
                                                    return <Tag color="blue">ลับ</Tag>;
                                                case 2:
                                                    return <Tag color="red">ลับมาก</Tag>;
                                                case 3:
                                                    return <Tag color="gold">ลับที่สุด</Tag>;
                                                default:
                                                    return <Tag color="default">ไม่ระบุ</Tag>;
                                            }
                                        })()
                                    }
                                </p>
                                <p><strong>วัน/เดือน/ปี:</strong> {currentFile.date}</p>
                                <p><strong>จาก:</strong> {currentFile.from}</p>
                                <p><strong>ถึง:</strong> {currentFile.to}</p>
                                <p><strong>เรื่อง:</strong> {currentFile.subject}</p>
                                <p><strong>ลงชื่อ:</strong> {currentFile.sign}</p>
                                <p><strong>วันที่รับ:</strong> {currentFile.date1}</p>
                                <p><strong>หมายเหตุ:</strong> {currentFile.note}</p>
                            </div>
                        ) : (
                            <p>กำลังโหลดข้อมูล...</p>
                        )}
                    </Modal>

                </>
            )}



            {/* Modal logout */}
            <Modal
                title="คุณต้องการออกจากระบบหรือไม่?"
                open={logoutModalVisible}
                onOk={handleConfirmLogout}
                onCancel={handleCloseLogoutModal}
                okText="ออกจากระบบ"
                cancelText="ยกเลิก"
                closable={false}
                maskClosable={false}
            >
                <p>คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?</p>
            </Modal>

            <Modal
                title="ข้อผิดพลาด"
                open={res}
                onOk={() => setRes(false)}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setRes(false)}>
                        ตกลง
                    </Button>
                ]}
                closable={false}
                maskClosable={false}
            >

                <p>{errorMessage}</p>
            </Modal>

            <Modal
                title="เพิ่มข้อมูลสำเร็จ"
                open={ok}
                onOk={() => setOk(false)}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setOk(false)}>
                        ตกลง
                    </Button>
                ]}
                closable={false}
                maskClosable={false}
            >

                <p>{errorMessage}</p>
            </Modal>

            <Modal
                title="ลบข้อมูลสำเร็จ"
                open={del}
                onOk={() => setDel(false)}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setDel(false)}>
                        ตกลง
                    </Button>
                ]}
                closable={false}
                maskClosable={false}
            >

                <p>ลบข้อมูลสำเร็จ</p>
            </Modal>

        </Layout>
    )
}

export default App
