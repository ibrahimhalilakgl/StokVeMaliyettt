package com.inonu.stok_takip.entitiy;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@MappedSuperclass
public abstract class BaseEntity implements Serializable, Cloneable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    protected Long id;

    @PrePersist
    private void prePersist() {
        this.createDate= LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        this.updateDate = LocalDateTime.now();
    }

    LocalDateTime createDate;
    LocalDateTime updateDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public LocalDateTime getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(LocalDateTime updateDate) {
        this.updateDate = updateDate;
    }

    @Override
    public String toString() {
        return "BaseEntity{" +
                "id=" + id +
                ", createDate=" + createDate +
                ", updateDate=" + updateDate +
                '}';
    }
}
