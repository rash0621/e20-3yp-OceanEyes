package com.example.OceanEyes.StatusMessages;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

    /**
     * {status: "SUCCESS"/"FAIL",
     * message: " ",
     * data: Any type of response}
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public class ActionStatusMessage<T> {
        private String status;
        private String message;
        private T data;


//        public ActionStatusMessage(String status, String message, T data) {
//            this.status = status;
//            this.message = message;
//            this.data = data;
//        }
    }
