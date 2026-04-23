package com.example.doit.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
// 1. null인 필드는 JSON으로 변환 시 무시합니다.
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponseDTO<T> {

    private final String status;
    private final Integer code;
    private final String message;
    private final PageMetaDTO meta;
    private final T data;


    // 2. (성공) 페이지 객체
    private ApiResponseDTO(String status, String message, PageMetaDTO meta, T data) {
        this.status = status;
        this.code = null;
        this.message = message;
        this.meta = meta;
        this.data = data;

    }

    // 3. (성공) 단일 객체
    private ApiResponseDTO(String status, String message, T data) {
        this.status = status;
        this.code = null;
        this.message = message;
        this.data = data;
        this.meta = null; // meta가 null이 되어 JSON에서 생략됨
    }

    // (성공) 반환 없음
    private ApiResponseDTO(String status, String message) {
        this.status = status;
        this.code = null;
        this.message = message;
        this.data = null; // data가 null이 되어 JSON에서 생략됨
        this.meta = null; // meta가 null이 되어 JSON에서 생략됨
    }

    // 실패
    private ApiResponseDTO(String status, Integer code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = null; // data가 null이 되어 JSON에서 생략됨
        this.meta = null; // meta가 null이 되어 JSON에서 생략됨
    }


    // --- 정적 팩토리 메서드 ---

    // (성공) 페이지 객체
    public static <E> ApiResponseDTO<List<E>> success(String message, Page<E> pageData) {
        PageMetaDTO meta = new PageMetaDTO(pageData);
        List<E> data = pageData.getContent();
        return new ApiResponseDTO<>("success", message, meta, data);
    }

    // (성공) 단일 객체
    public static <T> ApiResponseDTO<T> success(String message, T data) {
        return new ApiResponseDTO<>("success", message, data);
    }

    // (성공) 반환 없음
    public static <T> ApiResponseDTO<T> success(String message) {
        return new ApiResponseDTO<>("success", message);
    }

    // (실패) 오류 반환
    public static <T> ApiResponseDTO<T> error(Integer code, String message) {
        return new ApiResponseDTO<>("error", code, message);
    }
}