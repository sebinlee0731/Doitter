package com.example.doit.dto.common;

import lombok.Getter;
import org.springframework.data.domain.Page;

@Getter
public class PageMetaDTO {

    private final int page;
    private final int pageSize;
    private final long totalElements;
    private final int totalPages;

    public PageMetaDTO(Page<?> page) {
        // Spring의 Page는 0-based index이므로 +1 해줍니다.
        // 클라이언트는 1-based index를 선호합니다.
        this.page = page.getNumber() + 1;
        this.pageSize = page.getSize();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
    }

}
